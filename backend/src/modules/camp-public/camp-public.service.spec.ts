import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { CampParticipation } from '../camp-participations/entities/camp-participation.entity';
import { CampTeam } from '../camp-teams/entities/camp-team.entity';
import { Camp } from '../camps/entities/camp.entity';
import { TeamAssignment } from '../team-assignments/entities/team-assignment.entity';
import { CampPublicService } from './camp-public.service';

type MockRepository = {
  findOne: jest.Mock;
  find: jest.Mock;
  createQueryBuilder: jest.Mock;
};

type QueryBuilderMock = {
  innerJoin: jest.Mock;
  select: jest.Mock;
  addSelect: jest.Mock;
  where: jest.Mock;
  orderBy: jest.Mock;
  addOrderBy: jest.Mock;
  getRawMany: jest.Mock;
};

const createRepositoryMock = (): MockRepository => ({
  findOne: jest.fn(),
  find: jest.fn(),
  createQueryBuilder: jest.fn(),
});

const createQueryBuilderMock = (rows: unknown[] = []): QueryBuilderMock => {
  const qb: QueryBuilderMock = {
    innerJoin: jest.fn(),
    select: jest.fn(),
    addSelect: jest.fn(),
    where: jest.fn(),
    orderBy: jest.fn(),
    addOrderBy: jest.fn(),
    getRawMany: jest.fn().mockResolvedValue(rows),
  };

  qb.innerJoin.mockReturnValue(qb);
  qb.select.mockReturnValue(qb);
  qb.addSelect.mockReturnValue(qb);
  qb.where.mockReturnValue(qb);
  qb.orderBy.mockReturnValue(qb);
  qb.addOrderBy.mockReturnValue(qb);

  return qb;
};

describe('CampPublicService', () => {
  let service: CampPublicService;
  let campsRepository: MockRepository;
  let campTeamsRepository: MockRepository;
  let campParticipationsRepository: MockRepository;
  let teamAssignmentsRepository: MockRepository;

  const campId = 'camp-1';

  beforeEach(async () => {
    campsRepository = createRepositoryMock();
    campTeamsRepository = createRepositoryMock();
    campParticipationsRepository = createRepositoryMock();
    teamAssignmentsRepository = createRepositoryMock();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CampPublicService,
        { provide: getRepositoryToken(Camp), useValue: campsRepository },
        { provide: getRepositoryToken(CampTeam), useValue: campTeamsRepository },
        { provide: getRepositoryToken(CampParticipation), useValue: campParticipationsRepository },
        { provide: getRepositoryToken(TeamAssignment), useValue: teamAssignmentsRepository },
      ],
    }).compile();

    service = module.get<CampPublicService>(CampPublicService);
  });

  function mockCamp() {
    campsRepository.findOne.mockResolvedValue({
      id: campId,
      title: 'Camp A',
      year: 2026,
      startDate: '2026-08-01',
      endDate: '2026-08-07',
      location: 'Sofia',
      description: 'Desc',
      logoUrl: null,
      coverImageUrl: null,
      status: 'ACTIVE',
      finalizedAt: null,
      campType: {
        id: 'ct-1',
        name: 'Summer Camp',
        slug: 'summer-camp',
        logoUrl: null,
        coverImageUrl: null,
      },
    });
  }

  it('missing camp -> not found', async () => {
    campsRepository.findOne.mockResolvedValue(null);

    await expect(service.getCampPublicDetails(campId)).rejects.toThrow(NotFoundException);
  });

  it('public details returns expected shape', async () => {
    mockCamp();

    const result = await service.getCampPublicDetails(campId);

    expect(result).toEqual({
      campId: 'camp-1',
      title: 'Camp A',
      year: 2026,
      startDate: '2026-08-01',
      endDate: '2026-08-07',
      location: 'Sofia',
      description: 'Desc',
      logoUrl: null,
      coverImageUrl: null,
      status: 'ACTIVE',
      finalizedAt: null,
      campType: {
        campTypeId: 'ct-1',
        campTypeName: 'Summer Camp',
        campTypeSlug: 'summer-camp',
        campTypeLogoUrl: null,
        campTypeCoverImageUrl: null,
      },
    });
  });

  it('public teams returns sorted rows', async () => {
    mockCamp();
    const rows = [
      { teamId: 't1', teamPoints: 10, finalPosition: 1, name: 'Alpha' },
      { teamId: 't2', teamPoints: 8, finalPosition: 2, name: 'Bravo' },
    ];
    const qb = createQueryBuilderMock(rows);
    campTeamsRepository.createQueryBuilder.mockReturnValue(qb);

    const result = await service.getCampPublicTeams(campId);

    expect(result).toEqual(rows);
    expect(qb.orderBy).toHaveBeenCalledWith('team.teamPoints', 'DESC');
    expect(qb.addOrderBy).toHaveBeenCalledWith('team.finalPosition', 'ASC', 'NULLS LAST');
    expect(qb.addOrderBy).toHaveBeenCalledWith('team.name', 'ASC');
  });

  it('public participants returns sorted rows', async () => {
    mockCamp();
    const rows = [
      { participationId: 'p1', points: 9, kills: 4, survivals: 2 },
      { participationId: 'p2', points: 8, kills: 5, survivals: 1 },
    ];
    const qb = createQueryBuilderMock(rows);
    campParticipationsRepository.createQueryBuilder.mockReturnValue(qb);
    teamAssignmentsRepository.find.mockResolvedValue([]);

    const result = await service.getCampPublicParticipants(campId);

    expect(result).toEqual([
      { participationId: 'p1', points: 9, kills: 4, survivals: 2, currentTeam: null },
      { participationId: 'p2', points: 8, kills: 5, survivals: 1, currentTeam: null },
    ]);
    expect(qb.orderBy).toHaveBeenCalledWith('cp.points', 'DESC');
    expect(qb.addOrderBy).toHaveBeenCalledWith('cp.kills', 'DESC');
    expect(qb.addOrderBy).toHaveBeenCalledWith('cp.survivals', 'DESC');
    expect(qb.addOrderBy).toHaveBeenCalledWith('cp.createdAt', 'ASC');
  });

  it('current team resolution uses latest assignment', async () => {
    mockCamp();
    const qb = createQueryBuilderMock([{ participationId: 'p1', points: 1, kills: 1, survivals: 0 }]);
    campParticipationsRepository.createQueryBuilder.mockReturnValue(qb);
    teamAssignmentsRepository.find.mockResolvedValue([
      {
        participationId: 'p1',
        team: { id: 't2', name: 'Blue', color: '#00f', logoUrl: null },
      },
      {
        participationId: 'p1',
        team: { id: 't1', name: 'Red', color: '#f00', logoUrl: null },
      },
    ]);

    const result = await service.getCampPublicParticipants(campId);

    expect(result[0].currentTeam).toEqual({
      teamId: 't2',
      name: 'Blue',
      color: '#00f',
      logoUrl: null,
    });
    expect(teamAssignmentsRepository.find).toHaveBeenCalledWith(
      expect.objectContaining({
        order: {
          assignedAt: 'DESC',
          createdAt: 'DESC',
        },
      }),
    );
  });

  it('participants with no assignment return currentTeam = null', async () => {
    mockCamp();
    const qb = createQueryBuilderMock([{ participationId: 'p1', points: 1, kills: 1, survivals: 0 }]);
    campParticipationsRepository.createQueryBuilder.mockReturnValue(qb);
    teamAssignmentsRepository.find.mockResolvedValue([]);

    const result = await service.getCampPublicParticipants(campId);

    expect(result[0].currentTeam).toBeNull();
  });
});
