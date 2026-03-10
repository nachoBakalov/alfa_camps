import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CampParticipation } from '../camp-participations/entities/camp-participation.entity';
import { CampTeam } from '../camp-teams/entities/camp-team.entity';
import { CreateTeamAssignmentDto } from './dto/create-team-assignment.dto';
import { UpdateTeamAssignmentDto } from './dto/update-team-assignment.dto';
import { TeamAssignment } from './entities/team-assignment.entity';

@Injectable()
export class TeamAssignmentsService {
  constructor(
    @InjectRepository(TeamAssignment)
    private readonly teamAssignmentsRepository: Repository<TeamAssignment>,
    @InjectRepository(CampParticipation)
    private readonly campParticipationsRepository: Repository<CampParticipation>,
    @InjectRepository(CampTeam)
    private readonly campTeamsRepository: Repository<CampTeam>,
  ) {}

  async create(
    createTeamAssignmentDto: CreateTeamAssignmentDto,
    assignedBy: string | null,
  ): Promise<TeamAssignment> {
    const participation = await this.findParticipationOrThrow(
      createTeamAssignmentDto.participationId,
    );
    const team = await this.findTeamOrThrow(createTeamAssignmentDto.teamId);

    if (participation.campId !== team.campId) {
      throw new BadRequestException('Participation and team must belong to the same camp');
    }

    const assignedAt = createTeamAssignmentDto.assignedAt
      ? new Date(createTeamAssignmentDto.assignedAt)
      : new Date();

    const teamAssignment = this.teamAssignmentsRepository.create({
      participationId: createTeamAssignmentDto.participationId,
      teamId: createTeamAssignmentDto.teamId,
      assignedAt,
      assignedBy,
      note: createTeamAssignmentDto.note ?? null,
    });

    return this.teamAssignmentsRepository.save(teamAssignment);
  }

  async findAll(): Promise<TeamAssignment[]> {
    return this.teamAssignmentsRepository.find({
      order: {
        createdAt: 'DESC',
      },
    });
  }

  async findOne(id: string): Promise<TeamAssignment> {
    const assignment = await this.teamAssignmentsRepository.findOne({ where: { id } });

    if (!assignment) {
      throw new NotFoundException(`Team assignment with id ${id} was not found`);
    }

    return assignment;
  }

  async update(
    id: string,
    updateTeamAssignmentDto: UpdateTeamAssignmentDto,
  ): Promise<TeamAssignment> {
    const assignment = await this.findOne(id);

    const updatedAssignment = this.teamAssignmentsRepository.merge(assignment, {
      ...updateTeamAssignmentDto,
      assignedAt: updateTeamAssignmentDto.assignedAt
        ? new Date(updateTeamAssignmentDto.assignedAt)
        : assignment.assignedAt,
      note:
        updateTeamAssignmentDto.note !== undefined
          ? updateTeamAssignmentDto.note
          : assignment.note,
    });

    return this.teamAssignmentsRepository.save(updatedAssignment);
  }

  async remove(id: string): Promise<void> {
    const assignment = await this.findOne(id);
    await this.teamAssignmentsRepository.remove(assignment);
  }

  async findByParticipation(participationId: string): Promise<TeamAssignment[]> {
    await this.findParticipationOrThrow(participationId);

    return this.teamAssignmentsRepository.find({
      where: { participationId },
      order: {
        assignedAt: 'DESC',
        createdAt: 'DESC',
      },
    });
  }

  async findCurrentByParticipation(participationId: string): Promise<TeamAssignment | null> {
    await this.findParticipationOrThrow(participationId);

    const currentAssignment = await this.teamAssignmentsRepository.findOne({
      where: { participationId },
      order: {
        assignedAt: 'DESC',
        createdAt: 'DESC',
      },
    });

    return currentAssignment ?? null;
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
}
