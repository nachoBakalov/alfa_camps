import {
  BadRequestException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { QueryFailedError } from 'typeorm';
import { Battle } from '../battles/entities/battle.entity';
import { BattleType } from '../battles/enums/battle-type.enum';
import { CampParticipation } from '../camp-participations/entities/camp-participation.entity';
import { CampTeam } from '../camp-teams/entities/camp-team.entity';
import { BattlePlayerResultsService } from './battle-player-results.service';
import { BattlePlayerResult } from './entities/battle-player-result.entity';

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

const createUniqueError = (): QueryFailedError =>
  new QueryFailedError('QUERY', [], {
    code: '23505',
    constraint: 'UQ_battle_player_results_battle_participation',
  } as unknown as Error);

describe('BattlePlayerResultsService', () => {
  let service: BattlePlayerResultsService;
  let resultsRepository: MockRepository;
  let battlesRepository: MockRepository;
  let participationsRepository: MockRepository;
  let teamsRepository: MockRepository;

  const battleId = 'f4c9b396-1364-4ea6-86f2-c32c8cd39c2d';
  const participationId = '0f483515-ab58-4dd9-aebb-3af229de539a';
  const teamId = '622dbf30-60f2-4b6f-9ed0-cde9f70f6d74';

  const battle: Battle = {
    id: battleId,
    campId: 'camp-1',
    camp: {} as never,
    title: 'Mass Battle',
    battleType: BattleType.MASS_BATTLE,
    battleDate: '2026-07-10',
    session: null,
    winningTeamId: null,
    winningTeam: null,
    status: 'DRAFT' as never,
    notes: null,
    completedAt: null,
    createdBy: null,
    createdByUser: null,
    createdAt: new Date('2026-01-01T00:00:00.000Z'),
    updatedAt: new Date('2026-01-01T00:00:00.000Z'),
  };

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
    name: 'Wolves',
    color: null,
    logoUrl: null,
    teamPoints: 0,
    finalPosition: null,
    isActive: true,
    createdAt: new Date('2026-01-01T00:00:00.000Z'),
    updatedAt: new Date('2026-01-01T00:00:00.000Z'),
  };

  const result: BattlePlayerResult = {
    id: 'result-id',
    battleId,
    battle,
    participationId,
    participation,
    teamId,
    team,
    kills: 2,
    knifeKills: 1,
    survived: true,
    createdAt: new Date('2026-01-01T00:00:00.000Z'),
    updatedAt: new Date('2026-01-01T00:00:00.000Z'),
  };

  beforeEach(async () => {
    resultsRepository = createRepositoryMock();
    battlesRepository = createRepositoryMock();
    participationsRepository = createRepositoryMock();
    teamsRepository = createRepositoryMock();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BattlePlayerResultsService,
        {
          provide: getRepositoryToken(BattlePlayerResult),
          useValue: resultsRepository,
        },
        {
          provide: getRepositoryToken(Battle),
          useValue: battlesRepository,
        },
        {
          provide: getRepositoryToken(CampParticipation),
          useValue: participationsRepository,
        },
        {
          provide: getRepositoryToken(CampTeam),
          useValue: teamsRepository,
        },
      ],
    }).compile();

    service = module.get<BattlePlayerResultsService>(BattlePlayerResultsService);
  });

  it('create success', async () => {
    battlesRepository.findOne.mockResolvedValue(battle);
    participationsRepository.findOne.mockResolvedValue(participation);
    teamsRepository.findOne.mockResolvedValue(team);
    resultsRepository.create.mockReturnValue(result);
    resultsRepository.save.mockResolvedValue(result);

    const created = await service.create({
      battleId,
      participationId,
      teamId,
      kills: 2,
      knifeKills: 1,
      survived: true,
    });

    expect(created).toEqual(result);
  });

  it('create with missing battle -> not found', async () => {
    battlesRepository.findOne.mockResolvedValue(null);

    await expect(service.create({ battleId, participationId, teamId })).rejects.toThrow(
      NotFoundException,
    );
  });

  it('create with missing participation -> not found', async () => {
    battlesRepository.findOne.mockResolvedValue(battle);
    participationsRepository.findOne.mockResolvedValue(null);

    await expect(service.create({ battleId, participationId, teamId })).rejects.toThrow(
      NotFoundException,
    );
  });

  it('create with missing team -> not found', async () => {
    battlesRepository.findOne.mockResolvedValue(battle);
    participationsRepository.findOne.mockResolvedValue(participation);
    teamsRepository.findOne.mockResolvedValue(null);

    await expect(service.create({ battleId, participationId, teamId })).rejects.toThrow(
      NotFoundException,
    );
  });

  it('create with non-mass battle -> bad request', async () => {
    battlesRepository.findOne.mockResolvedValue({
      ...battle,
      battleType: BattleType.DUEL_SESSION,
    });
    participationsRepository.findOne.mockResolvedValue(participation);
    teamsRepository.findOne.mockResolvedValue(team);

    await expect(service.create({ battleId, participationId, teamId })).rejects.toThrow(
      BadRequestException,
    );
  });

  it('create with participation from different camp -> bad request', async () => {
    battlesRepository.findOne.mockResolvedValue(battle);
    participationsRepository.findOne.mockResolvedValue({ ...participation, campId: 'camp-2' });
    teamsRepository.findOne.mockResolvedValue(team);

    await expect(service.create({ battleId, participationId, teamId })).rejects.toThrow(
      BadRequestException,
    );
  });

  it('create with team from different camp -> bad request', async () => {
    battlesRepository.findOne.mockResolvedValue(battle);
    participationsRepository.findOne.mockResolvedValue(participation);
    teamsRepository.findOne.mockResolvedValue({ ...team, campId: 'camp-2' });

    await expect(service.create({ battleId, participationId, teamId })).rejects.toThrow(
      BadRequestException,
    );
  });

  it('create duplicate result -> conflict', async () => {
    battlesRepository.findOne.mockResolvedValue(battle);
    participationsRepository.findOne.mockResolvedValue(participation);
    teamsRepository.findOne.mockResolvedValue(team);
    resultsRepository.create.mockReturnValue(result);
    resultsRepository.save.mockRejectedValue(createUniqueError());

    await expect(service.create({ battleId, participationId, teamId })).rejects.toThrow(
      ConflictException,
    );
  });

  it('create/update with knifeKills greater than kills -> bad request', async () => {
    battlesRepository.findOne.mockResolvedValue(battle);
    participationsRepository.findOne.mockResolvedValue(participation);
    teamsRepository.findOne.mockResolvedValue(team);

    await expect(
      service.create({ battleId, participationId, teamId, kills: 1, knifeKills: 2 }),
    ).rejects.toThrow(BadRequestException);

    resultsRepository.findOne.mockResolvedValue(result);
    await expect(service.update(result.id, { kills: 1, knifeKills: 2 })).rejects.toThrow(
      BadRequestException,
    );
  });

  it('findAll', async () => {
    resultsRepository.find.mockResolvedValue([result]);

    const found = await service.findAll();

    expect(found).toEqual([result]);
  });

  it('findOne success', async () => {
    resultsRepository.findOne.mockResolvedValue(result);

    const found = await service.findOne(result.id);

    expect(found).toEqual(result);
  });

  it('findOne not found', async () => {
    resultsRepository.findOne.mockResolvedValue(null);

    await expect(service.findOne('missing-id')).rejects.toThrow(NotFoundException);
  });

  it('findByBattle', async () => {
    battlesRepository.findOne.mockResolvedValue(battle);
    resultsRepository.find.mockResolvedValue([result]);

    const found = await service.findByBattle(battleId);

    expect(found).toEqual([result]);
  });

  it('findByParticipation', async () => {
    participationsRepository.findOne.mockResolvedValue(participation);
    resultsRepository.find.mockResolvedValue([result]);

    const found = await service.findByParticipation(participationId);

    expect(found).toEqual([result]);
  });

  it('update success', async () => {
    resultsRepository.findOne.mockResolvedValue(result);
    battlesRepository.findOne.mockResolvedValue(battle);
    participationsRepository.findOne.mockResolvedValue(participation);
    teamsRepository.findOne.mockResolvedValue(team);
    resultsRepository.merge.mockReturnValue({ ...result, kills: 3 });
    resultsRepository.save.mockResolvedValue({ ...result, kills: 3 });

    const updated = await service.update(result.id, { kills: 3 });

    expect(updated.kills).toBe(3);
  });

  it('update not found', async () => {
    resultsRepository.findOne.mockResolvedValue(null);

    await expect(service.update('missing-id', { kills: 1 })).rejects.toThrow(NotFoundException);
  });

  it('remove success', async () => {
    resultsRepository.findOne.mockResolvedValue(result);
    resultsRepository.remove.mockResolvedValue(result);

    await service.remove(result.id);

    expect(resultsRepository.remove).toHaveBeenCalledWith(result);
  });

  it('remove not found', async () => {
    resultsRepository.findOne.mockResolvedValue(null);

    await expect(service.remove('missing-id')).rejects.toThrow(NotFoundException);
  });
});
