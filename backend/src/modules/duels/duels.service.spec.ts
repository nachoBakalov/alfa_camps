import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Battle } from '../battles/entities/battle.entity';
import { BattleType } from '../battles/enums/battle-type.enum';
import { CampParticipation } from '../camp-participations/entities/camp-participation.entity';
import { Duel } from './entities/duel.entity';
import { DuelsService } from './duels.service';

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

describe('DuelsService', () => {
  let service: DuelsService;
  let duelsRepository: MockRepository;
  let battlesRepository: MockRepository;
  let participationsRepository: MockRepository;

  const battleId = 'battle-id';
  const playerAId = 'player-a-id';
  const playerBId = 'player-b-id';

  const duelBattle: Battle = {
    id: battleId,
    campId: 'camp-1',
    camp: {} as never,
    title: 'Duel Session',
    battleType: BattleType.DUEL_SESSION,
    battleDate: '2026-08-01',
    session: null,
    winningTeamId: null,
    winningTeam: null,
    status: 'DRAFT' as never,
    notes: null,
    completedAt: null,
    createdBy: null,
    createdByUser: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const playerA: CampParticipation = {
    id: playerAId,
    campId: 'camp-1',
    camp: {} as never,
    playerId: 'p1',
    player: {} as never,
    kills: 0,
    knifeKills: 0,
    survivals: 0,
    duelWins: 0,
    massBattleWins: 0,
    points: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const playerB: CampParticipation = {
    id: playerBId,
    campId: 'camp-1',
    camp: {} as never,
    playerId: 'p2',
    player: {} as never,
    kills: 0,
    knifeKills: 0,
    survivals: 0,
    duelWins: 0,
    massBattleWins: 0,
    points: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const duel: Duel = {
    id: 'duel-id',
    battleId,
    battle: duelBattle,
    playerAParticipationId: playerAId,
    playerAParticipation: playerA,
    playerBParticipationId: playerBId,
    playerBParticipation: playerB,
    winnerParticipationId: null,
    winnerParticipation: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    duelsRepository = createRepositoryMock();
    battlesRepository = createRepositoryMock();
    participationsRepository = createRepositoryMock();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DuelsService,
        {
          provide: getRepositoryToken(Duel),
          useValue: duelsRepository,
        },
        {
          provide: getRepositoryToken(Battle),
          useValue: battlesRepository,
        },
        {
          provide: getRepositoryToken(CampParticipation),
          useValue: participationsRepository,
        },
      ],
    }).compile();

    service = module.get<DuelsService>(DuelsService);
  });

  it('create success', async () => {
    battlesRepository.findOne.mockResolvedValue(duelBattle);
    participationsRepository.findOne
      .mockResolvedValueOnce(playerA)
      .mockResolvedValueOnce(playerB);
    duelsRepository.create.mockReturnValue(duel);
    duelsRepository.save.mockResolvedValue(duel);

    const result = await service.create({
      battleId,
      playerAParticipationId: playerAId,
      playerBParticipationId: playerBId,
    });

    expect(result).toEqual(duel);
  });

  it('create with missing battle -> not found', async () => {
    battlesRepository.findOne.mockResolvedValue(null);

    await expect(
      service.create({
        battleId,
        playerAParticipationId: playerAId,
        playerBParticipationId: playerBId,
      }),
    ).rejects.toThrow(NotFoundException);
  });

  it('create with non-duel battle -> bad request', async () => {
    battlesRepository.findOne.mockResolvedValue({
      ...duelBattle,
      battleType: BattleType.MASS_BATTLE,
    });
    participationsRepository.findOne
      .mockResolvedValueOnce(playerA)
      .mockResolvedValueOnce(playerB);

    await expect(
      service.create({
        battleId,
        playerAParticipationId: playerAId,
        playerBParticipationId: playerBId,
      }),
    ).rejects.toThrow(BadRequestException);
  });

  it('create with missing player A -> not found', async () => {
    battlesRepository.findOne.mockResolvedValue(duelBattle);
    participationsRepository.findOne.mockResolvedValueOnce(null);

    await expect(
      service.create({
        battleId,
        playerAParticipationId: playerAId,
        playerBParticipationId: playerBId,
      }),
    ).rejects.toThrow(NotFoundException);
  });

  it('create with missing player B -> not found', async () => {
    battlesRepository.findOne.mockResolvedValue(duelBattle);
    participationsRepository.findOne
      .mockResolvedValueOnce(playerA)
      .mockResolvedValueOnce(null);

    await expect(
      service.create({
        battleId,
        playerAParticipationId: playerAId,
        playerBParticipationId: playerBId,
      }),
    ).rejects.toThrow(NotFoundException);
  });

  it('create with same player A and B -> bad request', async () => {
    battlesRepository.findOne.mockResolvedValue(duelBattle);
    participationsRepository.findOne
      .mockResolvedValueOnce(playerA)
      .mockResolvedValueOnce(playerA);

    await expect(
      service.create({
        battleId,
        playerAParticipationId: playerAId,
        playerBParticipationId: playerAId,
      }),
    ).rejects.toThrow(BadRequestException);
  });

  it('create with player participation from different camp -> bad request', async () => {
    battlesRepository.findOne.mockResolvedValue(duelBattle);
    participationsRepository.findOne
      .mockResolvedValueOnce(playerA)
      .mockResolvedValueOnce({ ...playerB, campId: 'camp-2' });

    await expect(
      service.create({
        battleId,
        playerAParticipationId: playerAId,
        playerBParticipationId: playerBId,
      }),
    ).rejects.toThrow(BadRequestException);
  });

  it('create with invalid winner -> bad request', async () => {
    const winner = { ...playerA, id: 'winner-other' };

    battlesRepository.findOne.mockResolvedValue(duelBattle);
    participationsRepository.findOne
      .mockResolvedValueOnce(playerA)
      .mockResolvedValueOnce(playerB)
      .mockResolvedValueOnce(winner);

    await expect(
      service.create({
        battleId,
        playerAParticipationId: playerAId,
        playerBParticipationId: playerBId,
        winnerParticipationId: winner.id,
      }),
    ).rejects.toThrow(BadRequestException);
  });

  it('create with valid winner -> success', async () => {
    const duelWithWinner = { ...duel, winnerParticipationId: playerAId, winnerParticipation: playerA };

    battlesRepository.findOne.mockResolvedValue(duelBattle);
    participationsRepository.findOne
      .mockResolvedValueOnce(playerA)
      .mockResolvedValueOnce(playerB)
      .mockResolvedValueOnce(playerA);
    duelsRepository.create.mockReturnValue(duelWithWinner);
    duelsRepository.save.mockResolvedValue(duelWithWinner);

    const result = await service.create({
      battleId,
      playerAParticipationId: playerAId,
      playerBParticipationId: playerBId,
      winnerParticipationId: playerAId,
    });

    expect(result.winnerParticipationId).toBe(playerAId);
  });

  it('findAll', async () => {
    duelsRepository.find.mockResolvedValue([duel]);

    const result = await service.findAll();

    expect(result).toEqual([duel]);
  });

  it('findOne success', async () => {
    duelsRepository.findOne.mockResolvedValue(duel);

    const result = await service.findOne(duel.id);

    expect(result).toEqual(duel);
  });

  it('findOne not found', async () => {
    duelsRepository.findOne.mockResolvedValue(null);

    await expect(service.findOne('missing-id')).rejects.toThrow(NotFoundException);
  });

  it('findByBattle', async () => {
    battlesRepository.findOne.mockResolvedValue(duelBattle);
    duelsRepository.find.mockResolvedValue([duel]);

    const result = await service.findByBattle(battleId);

    expect(result).toEqual([duel]);
  });

  it('findByParticipation', async () => {
    participationsRepository.findOne.mockResolvedValue(playerA);
    duelsRepository.find.mockResolvedValue([duel]);

    const result = await service.findByParticipation(playerAId);

    expect(result).toEqual([duel]);
  });

  it('update success', async () => {
    const updated = { ...duel, winnerParticipationId: playerBId, winnerParticipation: playerB };

    duelsRepository.findOne.mockResolvedValue(duel);
    participationsRepository.findOne.mockResolvedValue(playerB);
    duelsRepository.merge.mockReturnValue(updated);
    duelsRepository.save.mockResolvedValue(updated);

    const result = await service.update(duel.id, { winnerParticipationId: playerBId });

    expect(result.winnerParticipationId).toBe(playerBId);
  });

  it('update not found', async () => {
    duelsRepository.findOne.mockResolvedValue(null);

    await expect(service.update('missing-id', { winnerParticipationId: playerAId })).rejects.toThrow(
      NotFoundException,
    );
  });

  it('update with invalid winner -> bad request', async () => {
    duelsRepository.findOne.mockResolvedValue(duel);
    participationsRepository.findOne.mockResolvedValue({ ...playerA, id: 'other-id' });

    await expect(
      service.update(duel.id, { winnerParticipationId: 'other-id' }),
    ).rejects.toThrow(BadRequestException);
  });

  it('remove success', async () => {
    duelsRepository.findOne.mockResolvedValue(duel);
    duelsRepository.remove.mockResolvedValue(duel);

    await service.remove(duel.id);

    expect(duelsRepository.remove).toHaveBeenCalledWith(duel);
  });

  it('remove not found', async () => {
    duelsRepository.findOne.mockResolvedValue(null);

    await expect(service.remove('missing-id')).rejects.toThrow(NotFoundException);
  });
});
