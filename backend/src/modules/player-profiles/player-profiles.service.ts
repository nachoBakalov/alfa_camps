import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { PlayerAchievement } from '../achievements/entities/player-achievement.entity';
import { CampParticipation } from '../camp-participations/entities/camp-participation.entity';
import { PlayerMedal } from '../medals/entities/player-medal.entity';
import { Player } from '../players/entities/player.entity';
import { PlayerRank } from '../ranks/entities/player-rank.entity';
import { TeamAssignment } from '../team-assignments/entities/team-assignment.entity';
import { PlayerProfileAchievementItemDto } from './dto/player-profile-achievement-item.dto';
import { PlayerProfileCurrentTeamDto } from './dto/player-profile-current-team.dto';
import {
  PlayerProfileParticipationItemDto,
  PlayerProfileParticipationStatsDto,
} from './dto/player-profile-participation-item.dto';
import { PlayerProfileRankItemDto } from './dto/player-profile-rank-item.dto';
import { PlayerProfileMedalItemDto } from './dto/player-profile-medal-item.dto';
import { PlayerProfileResponseDto } from './dto/player-profile-response.dto';

@Injectable()
export class PlayerProfilesService {
  constructor(
    @InjectRepository(Player)
    private readonly playersRepository: Repository<Player>,
    @InjectRepository(CampParticipation)
    private readonly campParticipationsRepository: Repository<CampParticipation>,
    @InjectRepository(TeamAssignment)
    private readonly teamAssignmentsRepository: Repository<TeamAssignment>,
    @InjectRepository(PlayerRank)
    private readonly playerRanksRepository: Repository<PlayerRank>,
    @InjectRepository(PlayerAchievement)
    private readonly playerAchievementsRepository: Repository<PlayerAchievement>,
    @InjectRepository(PlayerMedal)
    private readonly playerMedalsRepository: Repository<PlayerMedal>,
  ) {}

  async getPlayerProfile(playerId: string): Promise<PlayerProfileResponseDto> {
    const player = await this.playersRepository.findOne({ where: { id: playerId } });

    if (!player) {
      throw new NotFoundException(`Player with id ${playerId} was not found`);
    }

    const participations = await this.campParticipationsRepository.find({
      where: { playerId },
      relations: {
        camp: {
          campType: true,
        },
      },
      order: {
        camp: {
          year: 'DESC',
          startDate: 'DESC',
        },
        createdAt: 'DESC',
      },
    });

    const participationIds = participations.map((participation) => participation.id);

    const [teamAssignments, playerRanks, playerAchievements, playerMedals] = participationIds.length
      ? await Promise.all([
          this.teamAssignmentsRepository.find({
            where: { participationId: In(participationIds) },
            relations: {
              team: true,
            },
            order: {
              assignedAt: 'DESC',
              createdAt: 'DESC',
            },
          }),
          this.playerRanksRepository.find({
            where: { participationId: In(participationIds) },
            relations: {
              category: true,
              rankDefinition: true,
            },
            order: {
              unlockedAt: 'ASC',
            },
          }),
          this.playerAchievementsRepository.find({
            where: { participationId: In(participationIds) },
            relations: {
              achievement: true,
            },
            order: {
              unlockedAt: 'ASC',
            },
          }),
          this.playerMedalsRepository.find({
            where: { participationId: In(participationIds) },
            relations: {
              medal: true,
            },
            order: {
              awardedAt: 'DESC',
            },
          }),
        ])
      : [[], [], [], []];

    const currentTeamByParticipationId = new Map<string, PlayerProfileCurrentTeamDto>();
    for (const assignment of teamAssignments) {
      if (currentTeamByParticipationId.has(assignment.participationId)) {
        continue;
      }

      currentTeamByParticipationId.set(assignment.participationId, {
        teamId: assignment.team.id,
        name: assignment.team.name,
        color: assignment.team.color,
        logoUrl: assignment.team.logoUrl,
      });
    }

    const ranksByParticipationId = new Map<string, PlayerProfileRankItemDto[]>();
    for (const rank of playerRanks) {
      const list = ranksByParticipationId.get(rank.participationId) ?? [];
      list.push({
        categoryId: rank.categoryId,
        categoryCode: rank.category.code,
        categoryName: rank.category.name,
        rankDefinitionId: rank.rankDefinitionId,
        rankName: rank.rankDefinition.name,
        iconUrl: rank.rankDefinition.iconUrl,
        threshold: rank.rankDefinition.threshold,
        rankOrder: rank.rankDefinition.rankOrder,
        unlockedAt: rank.unlockedAt,
      });
      ranksByParticipationId.set(rank.participationId, list);
    }

    const achievementsByParticipationId = new Map<string, PlayerProfileAchievementItemDto[]>();
    for (const playerAchievement of playerAchievements) {
      const list = achievementsByParticipationId.get(playerAchievement.participationId) ?? [];
      list.push({
        achievementId: playerAchievement.achievementId,
        name: playerAchievement.achievement.name,
        description: playerAchievement.achievement.description,
        iconUrl: playerAchievement.achievement.iconUrl,
        conditionType: playerAchievement.achievement.conditionType,
        threshold: playerAchievement.achievement.threshold,
        unlockedAt: playerAchievement.unlockedAt,
      });
      achievementsByParticipationId.set(playerAchievement.participationId, list);
    }

    const medalsByParticipationId = new Map<string, PlayerProfileMedalItemDto[]>();
    for (const playerMedal of playerMedals) {
      const list = medalsByParticipationId.get(playerMedal.participationId) ?? [];
      list.push({
        playerMedalId: playerMedal.id,
        medalId: playerMedal.medalId,
        name: playerMedal.medal.name,
        description: playerMedal.medal.description,
        iconUrl: playerMedal.medal.iconUrl,
        type: playerMedal.medal.type,
        note: playerMedal.note,
        awardedAt: playerMedal.awardedAt,
      });
      medalsByParticipationId.set(playerMedal.participationId, list);
    }

    const profileParticipations: PlayerProfileParticipationItemDto[] = participations.map(
      (participation) => {
        const stats: PlayerProfileParticipationStatsDto = {
          points: participation.points,
          kills: participation.kills,
          knifeKills: participation.knifeKills,
          survivals: participation.survivals,
          duelWins: participation.duelWins,
          massBattleWins: participation.massBattleWins,
        };

        return {
          participationId: participation.id,
          campId: participation.campId,
          campTitle: participation.camp.title,
          campYear: participation.camp.year,
          campStatus: participation.camp.status,
          campTypeId: participation.camp.campTypeId,
          campTypeName: participation.camp.campType.name,
          stats,
          currentTeam: currentTeamByParticipationId.get(participation.id) ?? null,
          ranks: ranksByParticipationId.get(participation.id) ?? [],
          achievements: achievementsByParticipationId.get(participation.id) ?? [],
          medals: medalsByParticipationId.get(participation.id) ?? [],
        };
      },
    );

    const totals = profileParticipations.reduce(
      (acc, participation) => {
        acc.totalPoints += participation.stats.points;
        acc.totalKills += participation.stats.kills;
        acc.totalKnifeKills += participation.stats.knifeKills;
        acc.totalSurvivals += participation.stats.survivals;
        acc.totalDuelWins += participation.stats.duelWins;
        acc.totalMassBattleWins += participation.stats.massBattleWins;
        return acc;
      },
      {
        totalPoints: 0,
        totalKills: 0,
        totalKnifeKills: 0,
        totalSurvivals: 0,
        totalDuelWins: 0,
        totalMassBattleWins: 0,
      },
    );

    return {
      playerId: player.id,
      firstName: player.firstName,
      lastName: player.lastName,
      nickname: player.nickname,
      avatarUrl: player.avatarUrl,
      isActive: player.isActive,
      totalPoints: totals.totalPoints,
      totalKills: totals.totalKills,
      totalKnifeKills: totals.totalKnifeKills,
      totalSurvivals: totals.totalSurvivals,
      totalDuelWins: totals.totalDuelWins,
      totalMassBattleWins: totals.totalMassBattleWins,
      totalParticipations: profileParticipations.length,
      participations: profileParticipations,
    };
  }
}
