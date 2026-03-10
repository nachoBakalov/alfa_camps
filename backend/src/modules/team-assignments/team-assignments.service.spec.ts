import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { CampParticipation } from '../camp-participations/entities/camp-participation.entity';
import { CampTeam } from '../camp-teams/entities/camp-team.entity';
import { TeamAssignment } from './entities/team-assignment.entity';
import { TeamAssignmentsService } from './team-assignments.service';

type MockRepository = {
  create: jest.Mock;
  save: jest.Mock;
  find: jest.Mock;
  findOne: jest.Mock;
  merge: jest.Mock;
  remove: jest.Mock;
};

const createRepositoryMock = (): MockRepository => ({
  create: jest.fn(),
  save: jest.fn(),
  find: jest.fn(),
  findOne: jest.fn(),
  merge: jest.fn(),
  remove: jest.fn(),
});

describe('TeamAssignmentsService', () => {
  let service: TeamAssignmentsService;
  let teamAssignmentsRepository: MockRepository;
  let campParticipationsRepository: MockRepository;
  let campTeamsRepository: MockRepository;

  const participationId = '2ad80f89-2f41-4957-a63b-064220d9b492';
  const teamId = '6b81cf4c-8f66-4309-95a0-a6aa4bf0b707';

  const participation: CampParticipation = {
    id: participationId,
    campId: 'camp-1',
    camp: {} as never,
    playerId: 'player-1',
    player: {} as never,
    kills: 0,
    knifeKills: 0,
    survivals: 0,
    duelWins: 0,
    massBattleWins: 0,
    points: 0,
    createdAt: new Date('2026-01-01T00:00:00.000Z'),
    updatedAt: new Date('2026-01-01T00:00:00.000Z'),
  };

  const team: CampTeam = {
    id: teamId,
    campId: 'camp-1',
    camp: {} as never,
    name: 'Lions',
    color: null,
    logoUrl: null,
    teamPoints: 0,
    finalPosition: null,
    isActive: true,
    createdAt: new Date('2026-01-01T00:00:00.000Z'),
    updatedAt: new Date('2026-01-01T00:00:00.000Z'),
  };

  const assignment: TeamAssignment = {
    id: 'assignment-id',
    participationId,
    participation,
    teamId,
    team,
    assignedAt: new Date('2026-07-01T10:00:00.000Z'),
    assignedBy: 'user-id',
    assignedByUser: null,
    note: 'Initial assignment',
    createdAt: new Date('2026-07-01T10:00:00.000Z'),
    updatedAt: new Date('2026-07-01T10:00:00.000Z'),
  };

  beforeEach(async () => {
    teamAssignmentsRepository = createRepositoryMock();
    campParticipationsRepository = createRepositoryMock();
    campTeamsRepository = createRepositoryMock();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TeamAssignmentsService,
        {
          provide: getRepositoryToken(TeamAssignment),
          useValue: teamAssignmentsRepository,
        },
        {
          provide: getRepositoryToken(CampParticipation),
          useValue: campParticipationsRepository,
        },
        {
          provide: getRepositoryToken(CampTeam),
          useValue: campTeamsRepository,
        },
      ],
    }).compile();

    service = module.get<TeamAssignmentsService>(TeamAssignmentsService);
  });

  it('create success', async () => {
    campParticipationsRepository.findOne.mockResolvedValue(participation);
    campTeamsRepository.findOne.mockResolvedValue(team);
    teamAssignmentsRepository.create.mockReturnValue(assignment);
    teamAssignmentsRepository.save.mockResolvedValue(assignment);

    const result = await service.create(
      {
        participationId,
        teamId,
        assignedAt: '2026-07-01T10:00:00.000Z',
        note: 'Initial assignment',
      },
      'user-id',
    );

    expect(result).toEqual(assignment);
    expect(teamAssignmentsRepository.save).toHaveBeenCalledWith(assignment);
  });

  it('create with missing participation -> not found', async () => {
    campParticipationsRepository.findOne.mockResolvedValue(null);

    await expect(service.create({ participationId, teamId }, 'user-id')).rejects.toThrow(
      new NotFoundException(`Camp participation with id ${participationId} was not found`),
    );
  });

  it('create with missing team -> not found', async () => {
    campParticipationsRepository.findOne.mockResolvedValue(participation);
    campTeamsRepository.findOne.mockResolvedValue(null);

    await expect(service.create({ participationId, teamId }, 'user-id')).rejects.toThrow(
      new NotFoundException(`Camp team with id ${teamId} was not found`),
    );
  });

  it('create with participation/team from different camps -> bad request', async () => {
    campParticipationsRepository.findOne.mockResolvedValue(participation);
    campTeamsRepository.findOne.mockResolvedValue({ ...team, campId: 'camp-2' });

    await expect(service.create({ participationId, teamId }, 'user-id')).rejects.toThrow(
      new BadRequestException('Participation and team must belong to the same camp'),
    );
  });

  it('findAll', async () => {
    teamAssignmentsRepository.find.mockResolvedValue([assignment]);

    const result = await service.findAll();

    expect(teamAssignmentsRepository.find).toHaveBeenCalledWith({
      order: {
        createdAt: 'DESC',
      },
    });
    expect(result).toEqual([assignment]);
  });

  it('findOne success', async () => {
    teamAssignmentsRepository.findOne.mockResolvedValue(assignment);

    const result = await service.findOne(assignment.id);

    expect(teamAssignmentsRepository.findOne).toHaveBeenCalledWith({
      where: { id: assignment.id },
    });
    expect(result).toEqual(assignment);
  });

  it('findOne not found', async () => {
    teamAssignmentsRepository.findOne.mockResolvedValue(null);

    await expect(service.findOne('missing-id')).rejects.toThrow(NotFoundException);
  });

  it('findByParticipation', async () => {
    campParticipationsRepository.findOne.mockResolvedValue(participation);
    teamAssignmentsRepository.find.mockResolvedValue([assignment]);

    const result = await service.findByParticipation(participationId);

    expect(teamAssignmentsRepository.find).toHaveBeenCalledWith({
      where: { participationId },
      order: {
        assignedAt: 'DESC',
        createdAt: 'DESC',
      },
    });
    expect(result).toEqual([assignment]);
  });

  it('findCurrentByParticipation with assignments', async () => {
    campParticipationsRepository.findOne.mockResolvedValue(participation);
    teamAssignmentsRepository.findOne.mockResolvedValue(assignment);

    const result = await service.findCurrentByParticipation(participationId);

    expect(teamAssignmentsRepository.findOne).toHaveBeenCalledWith({
      where: { participationId },
      order: {
        assignedAt: 'DESC',
        createdAt: 'DESC',
      },
    });
    expect(result).toEqual(assignment);
  });

  it('findCurrentByParticipation with no assignments', async () => {
    campParticipationsRepository.findOne.mockResolvedValue(participation);
    teamAssignmentsRepository.findOne.mockResolvedValue(null);

    const result = await service.findCurrentByParticipation(participationId);

    expect(result).toBeNull();
  });

  it('update success', async () => {
    const dto = {
      assignedAt: '2026-07-02T10:00:00.000Z',
      note: 'Updated assignment',
    };
    const updatedAssignment = {
      ...assignment,
      assignedAt: new Date(dto.assignedAt),
      note: dto.note,
    };

    teamAssignmentsRepository.findOne.mockResolvedValue(assignment);
    teamAssignmentsRepository.merge.mockReturnValue(updatedAssignment);
    teamAssignmentsRepository.save.mockResolvedValue(updatedAssignment);

    const result = await service.update(assignment.id, dto);

    expect(teamAssignmentsRepository.save).toHaveBeenCalledWith(updatedAssignment);
    expect(result).toEqual(updatedAssignment);
  });

  it('update not found', async () => {
    teamAssignmentsRepository.findOne.mockResolvedValue(null);

    await expect(service.update('missing-id', { note: 'x' })).rejects.toThrow(
      NotFoundException,
    );
  });

  it('remove success', async () => {
    teamAssignmentsRepository.findOne.mockResolvedValue(assignment);
    teamAssignmentsRepository.remove.mockResolvedValue(assignment);

    await service.remove(assignment.id);

    expect(teamAssignmentsRepository.remove).toHaveBeenCalledWith(assignment);
  });

  it('remove not found', async () => {
    teamAssignmentsRepository.findOne.mockResolvedValue(null);

    await expect(service.remove('missing-id')).rejects.toThrow(NotFoundException);
  });
});
