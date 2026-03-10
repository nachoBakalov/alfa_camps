import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { CampTeam } from '../camp-teams/entities/camp-team.entity';
import { Camp } from '../camps/entities/camp.entity';
import { CampStatus } from '../camps/enums/camp-status.enum';
import { Battle } from './entities/battle.entity';
import { BattleSession } from './enums/battle-session.enum';
import { BattleStatus } from './enums/battle-status.enum';
import { BattleType } from './enums/battle-type.enum';
import { BattlesService } from './battles.service';

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

describe('BattlesService', () => {
  let service: BattlesService;
  let battlesRepository: MockRepository;
  let campsRepository: MockRepository;
  let campTeamsRepository: MockRepository;

  const campId = 'd92dc0a4-638e-4d8a-ad5f-8d14ea1d9eb8';
  const winningTeamId = '15acdb0e-3513-4d31-8eca-bbb5d3fa5c2c';

  const camp: Camp = {
    id: campId,
    campTypeId: 'camp-type-id',
    campType: {} as never,
    campTeams: [],
    title: 'Summer Camp',
    year: 2026,
    startDate: '2026-07-01',
    endDate: '2026-07-10',
    location: null,
    description: null,
    logoUrl: null,
    coverImageUrl: null,
    status: CampStatus.DRAFT,
    createdBy: null,
    createdByUser: null,
    finalizedAt: null,
    createdAt: new Date('2026-01-01T00:00:00.000Z'),
    updatedAt: new Date('2026-01-01T00:00:00.000Z'),
  };

  const team: CampTeam = {
    id: winningTeamId,
    campId,
    camp,
    name: 'Wolves',
    color: null,
    logoUrl: null,
    teamPoints: 0,
    finalPosition: null,
    isActive: true,
    createdAt: new Date('2026-01-01T00:00:00.000Z'),
    updatedAt: new Date('2026-01-01T00:00:00.000Z'),
  };

  const battle: Battle = {
    id: 'battle-id',
    campId,
    camp,
    title: 'Final Battle',
    battleType: BattleType.MASS_BATTLE,
    battleDate: '2026-07-03',
    session: BattleSession.MORNING,
    winningTeamId,
    winningTeam: team,
    status: BattleStatus.DRAFT,
    notes: 'Battle notes',
    completedAt: null,
    createdBy: 'user-id',
    createdByUser: null,
    createdAt: new Date('2026-07-01T00:00:00.000Z'),
    updatedAt: new Date('2026-07-01T00:00:00.000Z'),
  };

  beforeEach(async () => {
    battlesRepository = createRepositoryMock();
    campsRepository = createRepositoryMock();
    campTeamsRepository = createRepositoryMock();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BattlesService,
        {
          provide: getRepositoryToken(Battle),
          useValue: battlesRepository,
        },
        {
          provide: getRepositoryToken(Camp),
          useValue: campsRepository,
        },
        {
          provide: getRepositoryToken(CampTeam),
          useValue: campTeamsRepository,
        },
      ],
    }).compile();

    service = module.get<BattlesService>(BattlesService);
  });

  it('create success', async () => {
    campsRepository.findOne.mockResolvedValue(camp);
    campTeamsRepository.findOne.mockResolvedValue(team);
    battlesRepository.create.mockReturnValue(battle);
    battlesRepository.save.mockResolvedValue(battle);

    const result = await service.create(
      {
        campId,
        title: 'Final Battle',
        battleType: BattleType.MASS_BATTLE,
        battleDate: '2026-07-03',
        session: BattleSession.MORNING,
        winningTeamId,
        notes: 'Battle notes',
      },
      'user-id',
    );

    expect(result).toEqual(battle);
  });

  it('create with missing camp -> not found', async () => {
    campsRepository.findOne.mockResolvedValue(null);

    await expect(
      service.create(
        {
          campId,
          title: 'Final Battle',
          battleType: BattleType.MASS_BATTLE,
          battleDate: '2026-07-03',
        },
        'user-id',
      ),
    ).rejects.toThrow(new NotFoundException(`Camp with id ${campId} was not found`));
  });

  it('create with winning team from missing team -> not found', async () => {
    campsRepository.findOne.mockResolvedValue(camp);
    campTeamsRepository.findOne.mockResolvedValue(null);

    await expect(
      service.create(
        {
          campId,
          title: 'Final Battle',
          battleType: BattleType.MASS_BATTLE,
          battleDate: '2026-07-03',
          winningTeamId,
        },
        'user-id',
      ),
    ).rejects.toThrow(
      new NotFoundException(`Camp team with id ${winningTeamId} was not found`),
    );
  });

  it('create with winning team from different camp -> bad request', async () => {
    campsRepository.findOne.mockResolvedValue(camp);
    campTeamsRepository.findOne.mockResolvedValue({ ...team, campId: 'other-camp' });

    await expect(
      service.create(
        {
          campId,
          title: 'Final Battle',
          battleType: BattleType.MASS_BATTLE,
          battleDate: '2026-07-03',
          winningTeamId,
        },
        'user-id',
      ),
    ).rejects.toThrow(new BadRequestException('Winning team must belong to the same camp'));
  });

  it('findAll', async () => {
    battlesRepository.find.mockResolvedValue([battle]);

    const result = await service.findAll();

    expect(battlesRepository.find).toHaveBeenCalledWith({
      order: {
        battleDate: 'DESC',
        createdAt: 'DESC',
      },
    });
    expect(result).toEqual([battle]);
  });

  it('findOne success', async () => {
    battlesRepository.findOne.mockResolvedValue(battle);

    const result = await service.findOne(battle.id);

    expect(result).toEqual(battle);
  });

  it('findOne not found', async () => {
    battlesRepository.findOne.mockResolvedValue(null);

    await expect(service.findOne('missing-id')).rejects.toThrow(NotFoundException);
  });

  it('findByCamp', async () => {
    campsRepository.findOne.mockResolvedValue(camp);
    battlesRepository.find.mockResolvedValue([battle]);

    const result = await service.findByCamp(campId);

    expect(result).toEqual([battle]);
  });

  it('update success', async () => {
    const updatedBattle = { ...battle, title: 'Updated' };

    battlesRepository.findOne.mockResolvedValue(battle);
    battlesRepository.merge.mockReturnValue(updatedBattle);
    battlesRepository.save.mockResolvedValue(updatedBattle);

    const result = await service.update(battle.id, { title: 'Updated' });

    expect(result).toEqual(updatedBattle);
  });

  it('update not found', async () => {
    battlesRepository.findOne.mockResolvedValue(null);

    await expect(service.update('missing-id', { title: 'Updated' })).rejects.toThrow(
      NotFoundException,
    );
  });

  it('update to COMPLETED sets completedAt', async () => {
    const merged = { ...battle, status: BattleStatus.COMPLETED };

    battlesRepository.findOne.mockResolvedValue(battle);
    battlesRepository.merge.mockImplementation((_existing, payload) => ({
      ...battle,
      ...payload,
    }));
    battlesRepository.save.mockImplementation(async (value) => value);

    const result = await service.update(battle.id, { status: BattleStatus.COMPLETED });

    expect(result.status).toBe(BattleStatus.COMPLETED);
    expect(result.completedAt).toBeInstanceOf(Date);
  });

  it('update to DRAFT or CANCELLED clears completedAt', async () => {
    const completedBattle = {
      ...battle,
      status: BattleStatus.COMPLETED,
      completedAt: new Date(),
    };

    battlesRepository.findOne.mockResolvedValue(completedBattle);
    battlesRepository.merge.mockImplementation((_existing, payload) => ({
      ...completedBattle,
      ...payload,
    }));
    battlesRepository.save.mockImplementation(async (value) => value);

    const draftResult = await service.update(battle.id, { status: BattleStatus.DRAFT });
    expect(draftResult.completedAt).toBeNull();

    const cancelledResult = await service.update(battle.id, {
      status: BattleStatus.CANCELLED,
    });
    expect(cancelledResult.completedAt).toBeNull();
  });

  it('remove success', async () => {
    battlesRepository.findOne.mockResolvedValue(battle);
    battlesRepository.remove.mockResolvedValue(battle);

    await service.remove(battle.id);

    expect(battlesRepository.remove).toHaveBeenCalledWith(battle);
  });

  it('remove not found', async () => {
    battlesRepository.findOne.mockResolvedValue(null);

    await expect(service.remove('missing-id')).rejects.toThrow(NotFoundException);
  });
});
