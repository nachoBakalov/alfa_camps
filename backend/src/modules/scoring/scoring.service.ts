import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, QueryFailedError, Repository } from 'typeorm';
import { BattlePlayerResult } from '../battle-player-results/entities/battle-player-result.entity';
import { Battle } from '../battles/entities/battle.entity';
import { BattleStatus } from '../battles/enums/battle-status.enum';
import { BattleType } from '../battles/enums/battle-type.enum';
import { Camp } from '../camps/entities/camp.entity';
import { CampStatus } from '../camps/enums/camp-status.enum';
import { CampParticipation } from '../camp-participations/entities/camp-participation.entity';
import { CampTeam } from '../camp-teams/entities/camp-team.entity';
import { Duel } from '../duels/entities/duel.entity';
import { AchievementsService } from '../achievements/achievements.service';
import { MedalsService } from '../medals/medals.service';
import { RanksService } from '../ranks/ranks.service';
import { TeamAssignment } from '../team-assignments/entities/team-assignment.entity';
import { FinalizeCampScoreResultDto } from './dto/finalize-camp-score-result.dto';
import { ApplyBattleScoreResultDto } from './dto/apply-battle-score-result.dto';
import { BattleScorePreviewDto } from './dto/battle-score-preview.dto';
import { BattleParticipationScoreLedger } from './entities/battle-participation-score-ledger.entity';
import { BattleTeamScoreLedger } from './entities/battle-team-score-ledger.entity';
import { CampFinalizationLedger } from './entities/camp-finalization-ledger.entity';
import { ParticipationScoreDelta } from './interfaces/participation-score-delta.interface';
import { TeamScoreDelta } from './interfaces/team-score-delta.interface';

@Injectable()
export class ScoringService {
  private readonly logger = new Logger(ScoringService.name);

  constructor(
    @InjectRepository(Battle)
    private readonly battlesRepository: Repository<Battle>,
    @InjectRepository(Camp)
    private readonly campsRepository: Repository<Camp>,
    @InjectRepository(BattlePlayerResult)
    private readonly battlePlayerResultsRepository: Repository<BattlePlayerResult>,
    @InjectRepository(Duel)
    private readonly duelsRepository: Repository<Duel>,
    @InjectRepository(CampParticipation)
    private readonly campParticipationsRepository: Repository<CampParticipation>,
    private readonly ranksService: RanksService,
    private readonly achievementsService: AchievementsService,
    private readonly medalsService: MedalsService,
  ) {}

  async previewBattleScore(battleId: string): Promise<BattleScorePreviewDto> {
    const battle = await this.battlesRepository.findOne({ where: { id: battleId } });

    if (!battle) {
      throw new NotFoundException(`Battle with id ${battleId} was not found`);
    }

    if (battle.battleType === BattleType.MASS_BATTLE) {
      return this.previewMassBattle(battle);
    }

    return this.previewDuelSession(battle);
  }

  async applyBattleScore(battleId: string): Promise<ApplyBattleScoreResultDto> {
    const battle = await this.battlesRepository.findOne({ where: { id: battleId } });

    if (!battle) {
      throw new NotFoundException(`Battle with id ${battleId} was not found`);
    }

    if (battle.status !== BattleStatus.COMPLETED) {
      throw new BadRequestException('Score can be applied only for COMPLETED battles');
    }

    try {
      const preview = await this.previewBattleScore(battleId);

      await this.battlesRepository.manager.transaction(async (manager) => {
        const existingParticipationLedgers = await manager.find(BattleParticipationScoreLedger, {
          where: { battleId },
        });
        const existingTeamLedgers = await manager.find(BattleTeamScoreLedger, {
          where: { battleId },
        });

        const existingParticipationMap = new Map<string, BattleParticipationScoreLedger>(
          existingParticipationLedgers.map((row) => [row.participationId, row]),
        );
        const existingTeamMap = new Map<string, BattleTeamScoreLedger>(
          existingTeamLedgers.map((row) => [row.teamId, row]),
        );

        const allParticipationIds = new Set<string>([
          ...existingParticipationMap.keys(),
          ...preview.participationDeltas.map((row) => row.participationId),
        ]);
        const allTeamIds = new Set<string>([
          ...existingTeamMap.keys(),
          ...preview.teamDeltas.map((row) => row.teamId),
        ]);

        const newParticipationMap = new Map<string, ParticipationScoreDelta>(
          preview.participationDeltas.map((row) => [row.participationId, row]),
        );
        const newTeamMap = new Map<string, TeamScoreDelta>(
          preview.teamDeltas.map((row) => [row.teamId, row]),
        );

        for (const participationId of allParticipationIds) {
          const oldRow = existingParticipationMap.get(participationId);
          const newRow = newParticipationMap.get(participationId);

          const netKills = (newRow?.killsDelta ?? 0) - (oldRow?.killsDelta ?? 0);
          const netKnifeKills = (newRow?.knifeKillsDelta ?? 0) - (oldRow?.knifeKillsDelta ?? 0);
          const netSurvivals = (newRow?.survivalsDelta ?? 0) - (oldRow?.survivalsDelta ?? 0);
          const netDuelWins = (newRow?.duelWinsDelta ?? 0) - (oldRow?.duelWinsDelta ?? 0);
          const netMassBattleWins =
            (newRow?.massBattleWinsDelta ?? 0) - (oldRow?.massBattleWinsDelta ?? 0);
          const netPoints = (newRow?.pointsDelta ?? 0) - (oldRow?.pointsDelta ?? 0);

          if (netKills !== 0) {
            await manager.increment(CampParticipation, { id: participationId }, 'kills', netKills);
          }
          if (netKnifeKills !== 0) {
            await manager.increment(
              CampParticipation,
              { id: participationId },
              'knifeKills',
              netKnifeKills,
            );
          }
          if (netSurvivals !== 0) {
            await manager.increment(
              CampParticipation,
              { id: participationId },
              'survivals',
              netSurvivals,
            );
          }
          if (netDuelWins !== 0) {
            await manager.increment(CampParticipation, { id: participationId }, 'duelWins', netDuelWins);
          }
          if (netMassBattleWins !== 0) {
            await manager.increment(
              CampParticipation,
              { id: participationId },
              'massBattleWins',
              netMassBattleWins,
            );
          }
          if (netPoints !== 0) {
            await manager.increment(CampParticipation, { id: participationId }, 'points', netPoints);
          }
        }

        for (const teamId of allTeamIds) {
          const oldRow = existingTeamMap.get(teamId);
          const newRow = newTeamMap.get(teamId);
          const netTeamPoints = (newRow?.teamPointsDelta ?? 0) - (oldRow?.teamPointsDelta ?? 0);

          if (netTeamPoints !== 0) {
            await manager.increment(CampTeam, { id: teamId }, 'teamPoints', netTeamPoints);
          }
        }

        await manager.delete(BattleParticipationScoreLedger, { battleId });
        await manager.delete(BattleTeamScoreLedger, { battleId });

        if (preview.participationDeltas.length > 0) {
          await manager.insert(
            BattleParticipationScoreLedger,
            preview.participationDeltas.map((row) => ({
              battleId,
              participationId: row.participationId,
              killsDelta: row.killsDelta,
              knifeKillsDelta: row.knifeKillsDelta,
              survivalsDelta: row.survivalsDelta,
              duelWinsDelta: row.duelWinsDelta,
              massBattleWinsDelta: row.massBattleWinsDelta,
              pointsDelta: row.pointsDelta,
            })),
          );
        }

        if (preview.teamDeltas.length > 0) {
          await manager.insert(
            BattleTeamScoreLedger,
            preview.teamDeltas.map((row) => ({
              battleId,
              teamId: row.teamId,
              teamPointsDelta: row.teamPointsDelta,
            })),
          );
        }
      });

      const affectedParticipationIds = Array.from(
        new Set(preview.participationDeltas.map((row) => row.participationId)),
      );

      for (const participationId of affectedParticipationIds) {
        await this.ranksService.recomputeParticipationRanks(participationId);
        await this.achievementsService.unlockParticipationAchievements(participationId);
        await this.medalsService.unlockParticipationAutoMedals(participationId);
      }

      return {
        battleId: preview.battleId,
        battleType: preview.battleType,
        appliedParticipationCount: preview.participationDeltas.length,
        appliedTeamCount: preview.teamDeltas.length,
        message: 'Battle score deltas applied successfully',
      };
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof BadRequestException) {
        throw error;
      }

      if (error instanceof QueryFailedError) {
        const databaseError = error as QueryFailedError & {
          driverError?: { message?: string; code?: string; detail?: string };
        };
        const driverMessage = databaseError.driverError?.message ?? error.message;
        const driverCode = databaseError.driverError?.code ?? 'unknown';
        const driverDetail = databaseError.driverError?.detail;

        this.logger.error(
          `Database query failed during applyBattleScore for battleId=${battleId} (code=${driverCode}). message=${driverMessage}${driverDetail ? ` detail=${driverDetail}` : ''}`,
          error.stack,
        );

        throw new InternalServerErrorException(
          'Unable to apply battle score due to database schema/data issue. Ensure scoring migrations are applied and data is consistent.',
        );
      }

      const errorMessage = error instanceof Error ? error.message : String(error);
      this.logger.error(
        `Unexpected applyBattleScore failure for battleId=${battleId}. message=${errorMessage}`,
        error instanceof Error ? error.stack : undefined,
      );

      throw new InternalServerErrorException('Unable to apply battle score right now');
    }
  }

  async finalizeCampScore(campId: string): Promise<FinalizeCampScoreResultDto> {
    const camp = await this.campsRepository.findOne({ where: { id: campId } });

    if (!camp) {
      throw new NotFoundException(`Camp with id ${campId} was not found`);
    }

    const result = await this.campsRepository.manager.transaction(async (manager) => {
      const existingLedger = await manager.findOne(CampFinalizationLedger, { where: { campId } });

      if (existingLedger && camp.status === CampStatus.FINISHED) {
        return {
          campId,
          finalized: true,
          alreadyFinalized: true,
          appliedParticipationCount: 0,
          message: 'Camp score was already finalized',
        };
      }

      const rankedTeams = await manager.find(CampTeam, {
        where: { campId },
        order: { finalPosition: 'ASC' },
      });

      const teamsWithPosition = rankedTeams.filter((team) => team.finalPosition !== null);

      if (teamsWithPosition.length === 0) {
        throw new BadRequestException('At least one camp team with finalPosition is required');
      }

      const finalPositions = new Set<number>();

      for (const team of teamsWithPosition) {
        const position = team.finalPosition as number;

        if (position < 1) {
          throw new BadRequestException('Team finalPosition must be greater than or equal to 1');
        }

        if (finalPositions.has(position)) {
          throw new BadRequestException('Duplicate finalPosition values are not allowed');
        }

        finalPositions.add(position);
      }

      const positionBonusByTeamId = new Map<string, number>();
      for (const team of teamsWithPosition) {
        const position = team.finalPosition as number;
        let bonus = 1;
        if (position === 1) {
          bonus = 7;
        } else if (position === 2) {
          bonus = 5;
        } else if (position === 3) {
          bonus = 3;
        }

        positionBonusByTeamId.set(team.id, bonus);
      }

      const participations = await manager.find(CampParticipation, {
        where: { campId },
      });

      const participationIds = participations.map((participation) => participation.id);

      const assignments = participationIds.length
        ? await manager.find(TeamAssignment, {
            where: { participationId: In(participationIds) },
            order: {
              assignedAt: 'DESC',
              createdAt: 'DESC',
            },
          })
        : [];

      const latestTeamIdByParticipationId = new Map<string, string>();
      for (const assignment of assignments) {
        if (!latestTeamIdByParticipationId.has(assignment.participationId)) {
          latestTeamIdByParticipationId.set(assignment.participationId, assignment.teamId);
        }
      }

      let appliedParticipationCount = 0;

      for (const participation of participations) {
        const teamId = latestTeamIdByParticipationId.get(participation.id);
        if (!teamId) {
          continue;
        }

        const bonusPoints = positionBonusByTeamId.get(teamId);
        if (!bonusPoints) {
          continue;
        }

        await manager.increment(CampParticipation, { id: participation.id }, 'points', bonusPoints);
        appliedParticipationCount += 1;
      }

      const now = new Date();

      await manager.update(Camp, { id: campId }, { status: CampStatus.FINISHED, finalizedAt: now });

      if (!existingLedger) {
        await manager.insert(CampFinalizationLedger, {
          campId,
          appliedAt: now,
        });
      }

      return {
        campId,
        finalized: true,
        alreadyFinalized: false,
        appliedParticipationCount,
        message: 'Camp score finalized successfully',
      };
    });

    const campParticipations = await this.campParticipationsRepository.find({ where: { campId } });

    for (const participation of campParticipations) {
      await this.achievementsService.unlockParticipationAchievements(participation.id);
      await this.medalsService.unlockParticipationAutoMedals(participation.id);
    }

    return result;
  }

  private async previewMassBattle(battle: Battle): Promise<BattleScorePreviewDto> {
    const results = await this.battlePlayerResultsRepository.find({
      where: { battleId: battle.id },
      order: { createdAt: 'ASC' },
    });

    if (results.length === 0) {
      return {
        battleId: battle.id,
        battleType: battle.battleType,
        participationDeltas: [],
        teamDeltas: [],
      };
    }

    const participationMap = new Map<string, ParticipationScoreDelta>();

    for (const result of results) {
      const delta = this.getOrCreateParticipationDelta(participationMap, result.participationId);

      delta.killsDelta += result.kills;
      delta.knifeKillsDelta += result.knifeKills;
      delta.pointsDelta += result.kills;

      if (result.survived) {
        delta.survivalsDelta += 1;
        delta.pointsDelta += 2;
      }
    }

    const teamDeltas: TeamScoreDelta[] = [];

    if (battle.winningTeamId) {
      teamDeltas.push({ teamId: battle.winningTeamId, teamPointsDelta: 3 });

      for (const result of results) {
        if (result.teamId !== battle.winningTeamId) {
          continue;
        }

        const delta = this.getOrCreateParticipationDelta(participationMap, result.participationId);
        delta.massBattleWinsDelta += 1;
        delta.pointsDelta += 3;
      }
    }

    return {
      battleId: battle.id,
      battleType: battle.battleType,
      participationDeltas: Array.from(participationMap.values()),
      teamDeltas,
    };
  }

  private async previewDuelSession(battle: Battle): Promise<BattleScorePreviewDto> {
    const duels = await this.duelsRepository.find({
      where: { battleId: battle.id },
      order: { createdAt: 'ASC' },
    });

    const participationMap = new Map<string, ParticipationScoreDelta>();

    for (const duel of duels) {
      if (!duel.winnerParticipationId) {
        continue;
      }

      const delta = this.getOrCreateParticipationDelta(participationMap, duel.winnerParticipationId);
      delta.duelWinsDelta += 1;
      delta.pointsDelta += 1;
    }

    return {
      battleId: battle.id,
      battleType: battle.battleType,
      participationDeltas: Array.from(participationMap.values()),
      teamDeltas: [],
    };
  }

  private getOrCreateParticipationDelta(
    participationMap: Map<string, ParticipationScoreDelta>,
    participationId: string,
  ): ParticipationScoreDelta {
    const existing = participationMap.get(participationId);

    if (existing) {
      return existing;
    }

    const created: ParticipationScoreDelta = {
      participationId,
      killsDelta: 0,
      knifeKillsDelta: 0,
      survivalsDelta: 0,
      duelWinsDelta: 0,
      massBattleWinsDelta: 0,
      pointsDelta: 0,
    };

    participationMap.set(participationId, created);
    return created;
  }
}
