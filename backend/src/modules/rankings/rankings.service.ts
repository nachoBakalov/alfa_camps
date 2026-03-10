import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, SelectQueryBuilder } from 'typeorm';
import { CampParticipation } from '../camp-participations/entities/camp-participation.entity';
import { CampTeam } from '../camp-teams/entities/camp-team.entity';
import { Camp } from '../camps/entities/camp.entity';
import { PlayerRankingItemDto } from './dto/player-ranking-item.dto';
import { TeamStandingItemDto } from './dto/team-standing-item.dto';

@Injectable()
export class RankingsService {
  private static readonly DEFAULT_LIMIT = 10;

  constructor(
    @InjectRepository(Camp)
    private readonly campsRepository: Repository<Camp>,
    @InjectRepository(CampParticipation)
    private readonly campParticipationsRepository: Repository<CampParticipation>,
    @InjectRepository(CampTeam)
    private readonly campTeamsRepository: Repository<CampTeam>,
  ) {}

  async getCampPointsRanking(campId: string, limit?: number): Promise<PlayerRankingItemDto[]> {
    await this.ensureCampExists(campId);

    return this.createPlayerRankingQuery(campId)
      .orderBy('cp.points', 'DESC')
      .addOrderBy('cp.kills', 'DESC')
      .addOrderBy('cp.survivals', 'DESC')
      .addOrderBy('cp.createdAt', 'ASC')
      .take(this.resolveLimit(limit))
      .getRawMany<PlayerRankingItemDto>();
  }

  async getCampKillsRanking(campId: string, limit?: number): Promise<PlayerRankingItemDto[]> {
    await this.ensureCampExists(campId);

    return this.createPlayerRankingQuery(campId)
      .orderBy('cp.kills', 'DESC')
      .addOrderBy('cp.points', 'DESC')
      .addOrderBy('cp.survivals', 'DESC')
      .addOrderBy('cp.createdAt', 'ASC')
      .take(this.resolveLimit(limit))
      .getRawMany<PlayerRankingItemDto>();
  }

  async getCampSurvivalsRanking(campId: string, limit?: number): Promise<PlayerRankingItemDto[]> {
    await this.ensureCampExists(campId);

    return this.createPlayerRankingQuery(campId)
      .orderBy('cp.survivals', 'DESC')
      .addOrderBy('cp.points', 'DESC')
      .addOrderBy('cp.kills', 'DESC')
      .addOrderBy('cp.createdAt', 'ASC')
      .take(this.resolveLimit(limit))
      .getRawMany<PlayerRankingItemDto>();
  }

  async getCampTeamStandings(campId: string): Promise<TeamStandingItemDto[]> {
    await this.ensureCampExists(campId);

    return this.campTeamsRepository
      .createQueryBuilder('team')
      .select('team.id', 'teamId')
      .addSelect('team.name', 'name')
      .addSelect('team.color', 'color')
      .addSelect('team.logoUrl', 'logoUrl')
      .addSelect('team.teamPoints', 'teamPoints')
      .addSelect('team.finalPosition', 'finalPosition')
      .addSelect('team.isActive', 'isActive')
      .where('team.campId = :campId', { campId })
      .orderBy('team.teamPoints', 'DESC')
      .addOrderBy('team.finalPosition', 'ASC', 'NULLS LAST')
      .addOrderBy('team.name', 'ASC')
      .getRawMany<TeamStandingItemDto>();
  }

  private createPlayerRankingQuery(campId: string): SelectQueryBuilder<CampParticipation> {
    return this.campParticipationsRepository
      .createQueryBuilder('cp')
      .innerJoin('cp.player', 'player')
      .select('cp.id', 'participationId')
      .addSelect('cp.playerId', 'playerId')
      .addSelect('player.firstName', 'firstName')
      .addSelect('player.lastName', 'lastName')
      .addSelect('player.nickname', 'nickname')
      .addSelect('player.avatarUrl', 'avatarUrl')
      .addSelect('cp.campId', 'campId')
      .addSelect('cp.points', 'points')
      .addSelect('cp.kills', 'kills')
      .addSelect('cp.knifeKills', 'knifeKills')
      .addSelect('cp.survivals', 'survivals')
      .addSelect('cp.duelWins', 'duelWins')
      .addSelect('cp.massBattleWins', 'massBattleWins')
      .where('cp.campId = :campId', { campId });
  }

  private resolveLimit(limit?: number): number {
    return limit ?? RankingsService.DEFAULT_LIMIT;
  }

  private async ensureCampExists(campId: string): Promise<void> {
    const camp = await this.campsRepository.findOne({ where: { id: campId } });

    if (!camp) {
      throw new NotFoundException(`Camp with id ${campId} was not found`);
    }
  }
}
