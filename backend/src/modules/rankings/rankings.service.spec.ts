import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { CampParticipation } from '../camp-participations/entities/camp-participation.entity';
import { CampTeam } from '../camp-teams/entities/camp-team.entity';
import { Camp } from '../camps/entities/camp.entity';
import { RankingsService } from './rankings.service';

type MockRepository = {
  findOne: jest.Mock;
  createQueryBuilder: jest.Mock;
};

type QueryBuilderMock = {
  innerJoin: jest.Mock;
  select: jest.Mock;
  addSelect: jest.Mock;
  where: jest.Mock;
  orderBy: jest.Mock;
  addOrderBy: jest.Mock;
  take: jest.Mock;
  getRawMany: jest.Mock;
};

const createRepositoryMock = (): MockRepository => ({
  findOne: jest.fn(),
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
    take: jest.fn(),
    getRawMany: jest.fn().mockResolvedValue(rows),
  };

  qb.innerJoin.mockReturnValue(qb);
  qb.select.mockReturnValue(qb);
  qb.addSelect.mockReturnValue(qb);
  qb.where.mockReturnValue(qb);
  qb.orderBy.mockReturnValue(qb);
  qb.addOrderBy.mockReturnValue(qb);
  qb.take.mockReturnValue(qb);

  return qb;
};

describe('RankingsService', () => {
  let service: RankingsService;
  let campsRepository: MockRepository;
  let participationsRepository: MockRepository;
  let teamsRepository: MockRepository;

  const campId = 'camp-1';

  beforeEach(async () => {
    campsRepository = createRepositoryMock();
    participationsRepository = createRepositoryMock();
    teamsRepository = createRepositoryMock();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RankingsService,
        { provide: getRepositoryToken(Camp), useValue: campsRepository },
        { provide: getRepositoryToken(CampParticipation), useValue: participationsRepository },
        { provide: getRepositoryToken(CampTeam), useValue: teamsRepository },
      ],
    }).compile();

    service = module.get<RankingsService>(RankingsService);
  });

  it('missing camp -> not found', async () => {
    campsRepository.findOne.mockResolvedValue(null);

    await expect(service.getCampPointsRanking(campId)).rejects.toThrow(NotFoundException);
  });

  it('points ranking returns sorted rows', async () => {
    campsRepository.findOne.mockResolvedValue({ id: campId });
    const rows = [
      { participationId: 'p2', points: 9, kills: 2, survivals: 1 },
      { participationId: 'p1', points: 8, kills: 4, survivals: 0 },
    ];
    const qb = createQueryBuilderMock(rows);
    participationsRepository.createQueryBuilder.mockReturnValue(qb);

    const result = await service.getCampPointsRanking(campId);

    expect(result).toEqual(rows);
    expect(qb.orderBy).toHaveBeenCalledWith('cp.points', 'DESC');
    expect(qb.addOrderBy).toHaveBeenCalledWith('cp.kills', 'DESC');
    expect(qb.addOrderBy).toHaveBeenCalledWith('cp.survivals', 'DESC');
    expect(qb.addOrderBy).toHaveBeenCalledWith('cp.createdAt', 'ASC');
  });

  it('kills ranking returns sorted rows', async () => {
    campsRepository.findOne.mockResolvedValue({ id: campId });
    const rows = [
      { participationId: 'p2', kills: 9, points: 6, survivals: 2 },
      { participationId: 'p1', kills: 8, points: 7, survivals: 1 },
    ];
    const qb = createQueryBuilderMock(rows);
    participationsRepository.createQueryBuilder.mockReturnValue(qb);

    const result = await service.getCampKillsRanking(campId);

    expect(result).toEqual(rows);
    expect(qb.orderBy).toHaveBeenCalledWith('cp.kills', 'DESC');
    expect(qb.addOrderBy).toHaveBeenCalledWith('cp.points', 'DESC');
    expect(qb.addOrderBy).toHaveBeenCalledWith('cp.survivals', 'DESC');
    expect(qb.addOrderBy).toHaveBeenCalledWith('cp.createdAt', 'ASC');
  });

  it('survivals ranking returns sorted rows', async () => {
    campsRepository.findOne.mockResolvedValue({ id: campId });
    const rows = [
      { participationId: 'p2', survivals: 5, points: 4, kills: 2 },
      { participationId: 'p1', survivals: 4, points: 5, kills: 1 },
    ];
    const qb = createQueryBuilderMock(rows);
    participationsRepository.createQueryBuilder.mockReturnValue(qb);

    const result = await service.getCampSurvivalsRanking(campId);

    expect(result).toEqual(rows);
    expect(qb.orderBy).toHaveBeenCalledWith('cp.survivals', 'DESC');
    expect(qb.addOrderBy).toHaveBeenCalledWith('cp.points', 'DESC');
    expect(qb.addOrderBy).toHaveBeenCalledWith('cp.kills', 'DESC');
    expect(qb.addOrderBy).toHaveBeenCalledWith('cp.createdAt', 'ASC');
  });

  it('limit default behavior', async () => {
    campsRepository.findOne.mockResolvedValue({ id: campId });
    const qb = createQueryBuilderMock([]);
    participationsRepository.createQueryBuilder.mockReturnValue(qb);

    await service.getCampPointsRanking(campId);

    expect(qb.take).toHaveBeenCalledWith(10);
  });

  it('limit custom behavior', async () => {
    campsRepository.findOne.mockResolvedValue({ id: campId });
    const qb = createQueryBuilderMock([]);
    participationsRepository.createQueryBuilder.mockReturnValue(qb);

    await service.getCampPointsRanking(campId, 25);

    expect(qb.take).toHaveBeenCalledWith(25);
  });

  it('team standings returns sorted rows', async () => {
    campsRepository.findOne.mockResolvedValue({ id: campId });
    const rows = [
      { teamId: 't1', teamPoints: 10, finalPosition: 1, name: 'Alpha' },
      { teamId: 't2', teamPoints: 8, finalPosition: 2, name: 'Bravo' },
    ];
    const qb = createQueryBuilderMock(rows);
    teamsRepository.createQueryBuilder.mockReturnValue(qb);

    const result = await service.getCampTeamStandings(campId);

    expect(result).toEqual(rows);
    expect(qb.orderBy).toHaveBeenCalledWith('team.teamPoints', 'DESC');
    expect(qb.addOrderBy).toHaveBeenCalledWith('team.finalPosition', 'ASC', 'NULLS LAST');
    expect(qb.addOrderBy).toHaveBeenCalledWith('team.name', 'ASC');
  });
});
