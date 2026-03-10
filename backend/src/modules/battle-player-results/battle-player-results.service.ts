import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { QueryFailedError, Repository } from 'typeorm';
import { Battle } from '../battles/entities/battle.entity';
import { BattleType } from '../battles/enums/battle-type.enum';
import { CampParticipation } from '../camp-participations/entities/camp-participation.entity';
import { CampTeam } from '../camp-teams/entities/camp-team.entity';
import { CreateBattlePlayerResultDto } from './dto/create-battle-player-result.dto';
import { UpdateBattlePlayerResultDto } from './dto/update-battle-player-result.dto';
import { BattlePlayerResult } from './entities/battle-player-result.entity';

@Injectable()
export class BattlePlayerResultsService {
  constructor(
    @InjectRepository(BattlePlayerResult)
    private readonly battlePlayerResultsRepository: Repository<BattlePlayerResult>,
    @InjectRepository(Battle)
    private readonly battlesRepository: Repository<Battle>,
    @InjectRepository(CampParticipation)
    private readonly campParticipationsRepository: Repository<CampParticipation>,
    @InjectRepository(CampTeam)
    private readonly campTeamsRepository: Repository<CampTeam>,
  ) {}

  async create(
    createBattlePlayerResultDto: CreateBattlePlayerResultDto,
  ): Promise<BattlePlayerResult> {
    const battle = await this.findBattleOrThrow(createBattlePlayerResultDto.battleId);
    const participation = await this.findParticipationOrThrow(
      createBattlePlayerResultDto.participationId,
    );
    const team = await this.findTeamOrThrow(createBattlePlayerResultDto.teamId);

    this.validateCreateOrUpdateRules({
      battle,
      participation,
      team,
      kills: createBattlePlayerResultDto.kills ?? 0,
      knifeKills: createBattlePlayerResultDto.knifeKills ?? 0,
    });

    const result = this.battlePlayerResultsRepository.create({
      battleId: createBattlePlayerResultDto.battleId,
      participationId: createBattlePlayerResultDto.participationId,
      teamId: createBattlePlayerResultDto.teamId,
      kills: createBattlePlayerResultDto.kills ?? 0,
      knifeKills: createBattlePlayerResultDto.knifeKills ?? 0,
      survived: createBattlePlayerResultDto.survived ?? false,
    });

    try {
      return await this.battlePlayerResultsRepository.save(result);
    } catch (error: unknown) {
      this.handleUniqueConstraintError(error);
      throw error;
    }
  }

  async findAll(): Promise<BattlePlayerResult[]> {
    return this.battlePlayerResultsRepository.find({
      order: {
        createdAt: 'DESC',
      },
    });
  }

  async findOne(id: string): Promise<BattlePlayerResult> {
    const result = await this.battlePlayerResultsRepository.findOne({ where: { id } });

    if (!result) {
      throw new NotFoundException(`Battle player result with id ${id} was not found`);
    }

    return result;
  }

  async update(
    id: string,
    updateBattlePlayerResultDto: UpdateBattlePlayerResultDto,
  ): Promise<BattlePlayerResult> {
    const existingResult = await this.findOne(id);

    const battle = await this.findBattleOrThrow(existingResult.battleId);
    const participation = await this.findParticipationOrThrow(existingResult.participationId);
    const team = updateBattlePlayerResultDto.teamId
      ? await this.findTeamOrThrow(updateBattlePlayerResultDto.teamId)
      : await this.findTeamOrThrow(existingResult.teamId);

    const nextKills = updateBattlePlayerResultDto.kills ?? existingResult.kills;
    const nextKnifeKills = updateBattlePlayerResultDto.knifeKills ?? existingResult.knifeKills;

    this.validateCreateOrUpdateRules({
      battle,
      participation,
      team,
      kills: nextKills,
      knifeKills: nextKnifeKills,
    });

    const updatedResult = this.battlePlayerResultsRepository.merge(existingResult, {
      teamId: updateBattlePlayerResultDto.teamId ?? existingResult.teamId,
      kills: nextKills,
      knifeKills: nextKnifeKills,
      survived:
        updateBattlePlayerResultDto.survived !== undefined
          ? updateBattlePlayerResultDto.survived
          : existingResult.survived,
    });

    return this.battlePlayerResultsRepository.save(updatedResult);
  }

  async remove(id: string): Promise<void> {
    const result = await this.findOne(id);
    await this.battlePlayerResultsRepository.remove(result);
  }

  async findByBattle(battleId: string): Promise<BattlePlayerResult[]> {
    await this.findBattleOrThrow(battleId);

    return this.battlePlayerResultsRepository.find({
      where: { battleId },
      order: {
        createdAt: 'ASC',
      },
    });
  }

  async findByParticipation(participationId: string): Promise<BattlePlayerResult[]> {
    await this.findParticipationOrThrow(participationId);

    return this.battlePlayerResultsRepository.find({
      where: { participationId },
      order: {
        createdAt: 'ASC',
      },
    });
  }

  private async findBattleOrThrow(battleId: string): Promise<Battle> {
    const battle = await this.battlesRepository.findOne({ where: { id: battleId } });

    if (!battle) {
      throw new NotFoundException(`Battle with id ${battleId} was not found`);
    }

    return battle;
  }

  private async findParticipationOrThrow(
    participationId: string,
  ): Promise<CampParticipation> {
    const participation = await this.campParticipationsRepository.findOne({
      where: { id: participationId },
    });

    if (!participation) {
      throw new NotFoundException(
        `Camp participation with id ${participationId} was not found`,
      );
    }

    return participation;
  }

  private async findTeamOrThrow(teamId: string): Promise<CampTeam> {
    const team = await this.campTeamsRepository.findOne({ where: { id: teamId } });

    if (!team) {
      throw new NotFoundException(`Camp team with id ${teamId} was not found`);
    }

    return team;
  }

  private validateCreateOrUpdateRules(params: {
    battle: Battle;
    participation: CampParticipation;
    team: CampTeam;
    kills: number;
    knifeKills: number;
  }): void {
    const { battle, participation, team, kills, knifeKills } = params;

    if (battle.battleType !== BattleType.MASS_BATTLE) {
      throw new BadRequestException('Battle player results are allowed only for MASS_BATTLE');
    }

    if (participation.campId !== battle.campId) {
      throw new BadRequestException('Participation must belong to the same camp as battle');
    }

    if (team.campId !== battle.campId) {
      throw new BadRequestException('Team must belong to the same camp as battle');
    }

    if (knifeKills > kills) {
      throw new BadRequestException('knifeKills must not be greater than kills');
    }
  }

  private handleUniqueConstraintError(error: unknown): void {
    if (!(error instanceof QueryFailedError)) {
      return;
    }

    const driverError = error.driverError as {
      code?: string;
      constraint?: string;
    };

    if (driverError.code !== '23505') {
      return;
    }

    if (driverError.constraint?.includes('battle_participation')) {
      throw new ConflictException('Result already exists for this battle and participation');
    }

    throw new ConflictException('Battle player result with provided unique fields already exists');
  }
}
