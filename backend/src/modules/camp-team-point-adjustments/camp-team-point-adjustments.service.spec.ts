import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { CampTeam } from '../camp-teams/entities/camp-team.entity';
import { CampTeamPointAdjustmentsService } from './camp-team-point-adjustments.service';
import { CampTeamPointAdjustment } from './entities/camp-team-point-adjustment.entity';

type MockRepository = {
  findOne: jest.Mock;
  find: jest.Mock;
  manager?: {
    transaction: jest.Mock;
  };
};

const createRepositoryMock = (): MockRepository => ({
  findOne: jest.fn(),
  find: jest.fn(),
});

describe('CampTeamPointAdjustmentsService', () => {
  let service: CampTeamPointAdjustmentsService;
  let adjustmentsRepository: MockRepository;
  let campTeamsRepository: MockRepository;

  beforeEach(async () => {
    adjustmentsRepository = createRepositoryMock();
    campTeamsRepository = createRepositoryMock();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CampTeamPointAdjustmentsService,
        {
          provide: getRepositoryToken(CampTeamPointAdjustment),
          useValue: adjustmentsRepository,
        },
        {
          provide: getRepositoryToken(CampTeam),
          useValue: campTeamsRepository,
        },
      ],
    }).compile();

    service = module.get<CampTeamPointAdjustmentsService>(CampTeamPointAdjustmentsService);
  });

  function setupCreateTransaction(options?: { teamExists?: boolean }) {
    const teamExists = options?.teamExists ?? true;
    const teamId = 'team-1';
    const increments: Array<{ id: string; property: string; value: number }> = [];

    const adjustmentRepository = {
      create: jest.fn((payload: Partial<CampTeamPointAdjustment>) => payload),
      save: jest.fn(async (payload: Partial<CampTeamPointAdjustment>) => ({
        id: 'adjustment-1',
        campTeamId: payload.campTeamId,
        delta: payload.delta,
        reason: payload.reason ?? null,
        createdBy: payload.createdBy ?? null,
        createdAt: new Date('2026-03-16T10:00:00.000Z'),
        updatedAt: new Date('2026-03-16T10:00:00.000Z'),
      })),
    };

    const manager = {
      findOne: jest.fn(async (entity: unknown) => {
        if (entity === CampTeam && teamExists) {
          return { id: teamId } as CampTeam;
        }
        return null;
      }),
      getRepository: jest.fn((entity: unknown) => {
        if (entity === CampTeamPointAdjustment) {
          return adjustmentRepository;
        }
        throw new Error('Unexpected repository entity');
      }),
      increment: jest.fn(async (_entity: unknown, criteria: { id: string }, property: string, value: number) => {
        increments.push({ id: criteria.id, property, value });
      }),
    };

    adjustmentsRepository.manager = {
      transaction: jest.fn(async (callback: (transactionManager: typeof manager) => Promise<unknown>) => callback(manager)),
    };

    return {
      manager,
      teamId,
      increments,
      adjustmentRepository,
    };
  }

  it('create positive adjustment', async () => {
    const { increments } = setupCreateTransaction();

    const result = await service.create(
      {
        campTeamId: 'team-1',
        delta: 5,
        reason: 'Bonus points',
      },
      'user-1',
    );

    expect(result).toMatchObject({
      campTeamId: 'team-1',
      delta: 5,
      reason: 'Bonus points',
      createdBy: 'user-1',
    });
    expect(increments).toEqual([{ id: 'team-1', property: 'teamPoints', value: 5 }]);
  });

  it('create negative adjustment', async () => {
    const { increments } = setupCreateTransaction();

    const result = await service.create(
      {
        campTeamId: 'team-1',
        delta: -3,
        reason: 'Penalty',
      },
      null,
    );

    expect(result).toMatchObject({
      campTeamId: 'team-1',
      delta: -3,
      reason: 'Penalty',
      createdBy: null,
    });
    expect(increments).toEqual([{ id: 'team-1', property: 'teamPoints', value: -3 }]);
  });

  it('missing team -> not found', async () => {
    setupCreateTransaction({ teamExists: false });

    await expect(
      service.create(
        {
          campTeamId: 'missing-team',
          delta: 2,
          reason: 'manual',
        },
        'user-1',
      ),
    ).rejects.toThrow(new NotFoundException('Camp team with id missing-team was not found'));
  });

  it('list adjustments by team', async () => {
    campTeamsRepository.findOne.mockResolvedValue({ id: 'team-1' } as CampTeam);
    adjustmentsRepository.find.mockResolvedValue([
      {
        id: 'a2',
        campTeamId: 'team-1',
        delta: -2,
      },
      {
        id: 'a1',
        campTeamId: 'team-1',
        delta: 4,
      },
    ]);

    const result = await service.findByTeam('team-1');

    expect(campTeamsRepository.findOne).toHaveBeenCalledWith({ where: { id: 'team-1' } });
    expect(adjustmentsRepository.find).toHaveBeenCalledWith({
      where: { campTeamId: 'team-1' },
      order: { createdAt: 'DESC' },
    });
    expect(result).toEqual([
      {
        id: 'a2',
        campTeamId: 'team-1',
        delta: -2,
      },
      {
        id: 'a1',
        campTeamId: 'team-1',
        delta: 4,
      },
    ]);
  });
});
