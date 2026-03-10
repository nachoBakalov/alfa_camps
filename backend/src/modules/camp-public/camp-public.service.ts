import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { CampParticipation } from '../camp-participations/entities/camp-participation.entity';
import { CampTeam } from '../camp-teams/entities/camp-team.entity';
import { Camp } from '../camps/entities/camp.entity';
import { TeamAssignment } from '../team-assignments/entities/team-assignment.entity';
import { CampPublicDetailsDto } from './dto/camp-public-details.dto';
import { CampPublicParticipantItemDto } from './dto/camp-public-participant-item.dto';
import { CampPublicTeamItemDto } from './dto/camp-public-team-item.dto';

@Injectable()
export class CampPublicService {
  constructor(
    @InjectRepository(Camp)
    private readonly campsRepository: Repository<Camp>,
    @InjectRepository(CampTeam)
    private readonly campTeamsRepository: Repository<CampTeam>,
    @InjectRepository(CampParticipation)
    private readonly campParticipationsRepository: Repository<CampParticipation>,
    @InjectRepository(TeamAssignment)
    private readonly teamAssignmentsRepository: Repository<TeamAssignment>,
  ) {}

  async getCampPublicDetails(campId: string): Promise<CampPublicDetailsDto> {
    const camp = await this.findCampOrThrow(campId);

    return {
      campId: camp.id,
      title: camp.title,
      year: camp.year,
      startDate: camp.startDate,
      endDate: camp.endDate,
      location: camp.location,
      description: camp.description,
      logoUrl: camp.logoUrl,
      coverImageUrl: camp.coverImageUrl,
      status: camp.status,
      finalizedAt: camp.finalizedAt,
      campType: {
        campTypeId: camp.campType.id,
        campTypeName: camp.campType.name,
        campTypeSlug: camp.campType.slug,
        campTypeLogoUrl: camp.campType.logoUrl,
        campTypeCoverImageUrl: camp.campType.coverImageUrl,
      },
    };
  }

  async getCampPublicTeams(campId: string): Promise<CampPublicTeamItemDto[]> {
    await this.findCampOrThrow(campId);

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
      .getRawMany<CampPublicTeamItemDto>();
  }

  async getCampPublicParticipants(campId: string): Promise<CampPublicParticipantItemDto[]> {
    await this.findCampOrThrow(campId);

    const participants = await this.campParticipationsRepository
      .createQueryBuilder('cp')
      .innerJoin('cp.player', 'player')
      .select('cp.id', 'participationId')
      .addSelect('cp.playerId', 'playerId')
      .addSelect('player.firstName', 'firstName')
      .addSelect('player.lastName', 'lastName')
      .addSelect('player.nickname', 'nickname')
      .addSelect('player.avatarUrl', 'avatarUrl')
      .addSelect('cp.points', 'points')
      .addSelect('cp.kills', 'kills')
      .addSelect('cp.knifeKills', 'knifeKills')
      .addSelect('cp.survivals', 'survivals')
      .addSelect('cp.duelWins', 'duelWins')
      .addSelect('cp.massBattleWins', 'massBattleWins')
      .where('cp.campId = :campId', { campId })
      .orderBy('cp.points', 'DESC')
      .addOrderBy('cp.kills', 'DESC')
      .addOrderBy('cp.survivals', 'DESC')
      .addOrderBy('cp.createdAt', 'ASC')
      .getRawMany<CampPublicParticipantItemDto>();

    const participationIds = participants.map((participant) => participant.participationId);

    const assignments = participationIds.length
      ? await this.teamAssignmentsRepository.find({
          where: { participationId: In(participationIds) },
          relations: {
            team: true,
          },
          order: {
            assignedAt: 'DESC',
            createdAt: 'DESC',
          },
        })
      : [];

    const currentTeamByParticipationId = new Map<string, CampPublicParticipantItemDto['currentTeam']>();

    for (const assignment of assignments) {
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

    return participants.map((participant) => ({
      ...participant,
      currentTeam: currentTeamByParticipationId.get(participant.participationId) ?? null,
    }));
  }

  private async findCampOrThrow(campId: string): Promise<Camp> {
    const camp = await this.campsRepository.findOne({
      where: { id: campId },
      relations: {
        campType: true,
      },
    });

    if (!camp) {
      throw new NotFoundException(`Camp with id ${campId} was not found`);
    }

    return camp;
  }
}
