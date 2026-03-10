import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { BattlePlayerResult } from '../battle-player-results/entities/battle-player-result.entity';
import { Battle } from '../battles/entities/battle.entity';
import { BattleStatus } from '../battles/enums/battle-status.enum';
import { BattleType } from '../battles/enums/battle-type.enum';
import { Camp } from '../camps/entities/camp.entity';
import { CampStatus } from '../camps/enums/camp-status.enum';
import { CampParticipation } from '../camp-participations/entities/camp-participation.entity';
import { CampTeam } from '../camp-teams/entities/camp-team.entity';
import { Duel } from '../duels/entities/duel.entity';
import { AchievementsService } from '../achievements/achievements.service';
import { RanksService } from '../ranks/ranks.service';
import { TeamAssignment } from '../team-assignments/entities/team-assignment.entity';
import { BattleParticipationScoreLedger } from './entities/battle-participation-score-ledger.entity';
import { BattleTeamScoreLedger } from './entities/battle-team-score-ledger.entity';
import { CampFinalizationLedger } from './entities/camp-finalization-ledger.entity';
import { ScoringService } from './scoring.service';

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

const createRanksServiceMock = () => ({
  recomputeParticipationRanks: jest.fn(),
});

const createAchievementsServiceMock = () => ({
  unlockParticipationAchievements: jest.fn(),
});

describe('ScoringService', () => {
  let service: ScoringService;
  let battlesRepository: MockRepository;
  let campsRepository: MockRepository;
  let campParticipationsRepository: MockRepository;
  let battlePlayerResultsRepository: MockRepository;
  let duelsRepository: MockRepository;
  let ranksService: ReturnType<typeof createRanksServiceMock>;
  let achievementsService: ReturnType<typeof createAchievementsServiceMock>;
  let participationLedgerRepository: MockRepository;
  let teamLedgerRepository: MockRepository;

  const massBattleId = 'mass-battle-id';
  const duelBattleId = 'duel-battle-id';

  const massBattle: Battle = {
    id: massBattleId,
    campId: 'camp-1',
    camp: {} as never,
    title: 'Mass Battle',
    battleType: BattleType.MASS_BATTLE,
    battleDate: '2026-08-01',
    session: null,
    winningTeamId: null,
    winningTeam: null,
    status: BattleStatus.COMPLETED,
    notes: null,
    completedAt: new Date(),
    createdBy: null,
    createdByUser: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const duelBattle: Battle = {
    ...massBattle,
    id: duelBattleId,
    title: 'Duel Session',
    battleType: BattleType.DUEL_SESSION,
  };

  const makeResult = (
    id: string,
    participationId: string,
    teamId: string,
    kills: number,
    knifeKills: number,
    survived: boolean,
  ): BattlePlayerResult => ({
    id,
    battleId: massBattleId,
    battle: massBattle,
    participationId,
    participation: {} as never,
    teamId,
    team: {} as never,
    kills,
    knifeKills,
    survived,
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  const makeDuel = (id: string, winnerParticipationId: string | null): Duel => ({
    id,
    battleId: duelBattleId,
    battle: duelBattle,
    playerAParticipationId: 'pa',
    playerAParticipation: {} as never,
    playerBParticipationId: 'pb',
    playerBParticipation: {} as never,
    winnerParticipationId,
    winnerParticipation: winnerParticipationId ? ({} as never) : null,
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  function setupTransactionalManager() {
    const participationLedgerStore: Array<Record<string, unknown>> = [];
    const teamLedgerStore: Array<Record<string, unknown>> = [];
    const participationStats: Record<string, Record<string, number>> = {};
    const teamStats: Record<string, number> = {};

    const manager = {
      find: jest.fn(async (entity: unknown, options: { where: { battleId: string } }) => {
        if (entity === BattleParticipationScoreLedger) {
          return participationLedgerStore.filter((row) => row.battleId === options.where.battleId);
        }
        if (entity === BattleTeamScoreLedger) {
          return teamLedgerStore.filter((row) => row.battleId === options.where.battleId);
        }
        return [];
      }),
      increment: jest.fn(
        async (
          entity: unknown,
          criteria: { id: string },
          property: string,
          value: number,
        ): Promise<void> => {
          if (entity === CampParticipation) {
            if (!participationStats[criteria.id]) {
              participationStats[criteria.id] = {
                kills: 0,
                knifeKills: 0,
                survivals: 0,
                duelWins: 0,
                massBattleWins: 0,
                points: 0,
              };
            }
            participationStats[criteria.id][property] += value;
          }

          if (entity === CampTeam) {
            if (!teamStats[criteria.id]) {
              teamStats[criteria.id] = 0;
            }
            teamStats[criteria.id] += value;
          }
        },
      ),
      delete: jest.fn(async (entity: unknown, criteria: { battleId: string }) => {
        if (entity === BattleParticipationScoreLedger) {
          for (let index = participationLedgerStore.length - 1; index >= 0; index -= 1) {
            if (participationLedgerStore[index].battleId === criteria.battleId) {
              participationLedgerStore.splice(index, 1);
            }
          }
        }

        if (entity === BattleTeamScoreLedger) {
          for (let index = teamLedgerStore.length - 1; index >= 0; index -= 1) {
            if (teamLedgerStore[index].battleId === criteria.battleId) {
              teamLedgerStore.splice(index, 1);
            }
          }
        }
      }),
      insert: jest.fn(async (entity: unknown, rows: Array<Record<string, unknown>>) => {
        if (entity === BattleParticipationScoreLedger) {
          participationLedgerStore.push(...rows);
        }

        if (entity === BattleTeamScoreLedger) {
          teamLedgerStore.push(...rows);
        }
      }),
    };

    const transaction = jest.fn(async (callback: (transactionManager: typeof manager) => Promise<void>) => {
      await callback(manager);
    });

    battlesRepository.manager = { transaction };

    return {
      manager,
      transaction,
      participationLedgerStore,
      teamLedgerStore,
      participationStats,
      teamStats,
    };
  }

  beforeEach(async () => {
    battlesRepository = createRepositoryMock();
    campsRepository = createRepositoryMock();
    campParticipationsRepository = createRepositoryMock();
    battlePlayerResultsRepository = createRepositoryMock();
    duelsRepository = createRepositoryMock();
    ranksService = createRanksServiceMock();
    achievementsService = createAchievementsServiceMock();
    ranksService.recomputeParticipationRanks.mockResolvedValue(undefined);
    achievementsService.unlockParticipationAchievements.mockResolvedValue(undefined);
    participationLedgerRepository = createRepositoryMock();
    teamLedgerRepository = createRepositoryMock();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ScoringService,
        { provide: getRepositoryToken(Battle), useValue: battlesRepository },
        { provide: getRepositoryToken(Camp), useValue: campsRepository },
        { provide: getRepositoryToken(CampParticipation), useValue: campParticipationsRepository },
        {
          provide: getRepositoryToken(BattlePlayerResult),
          useValue: battlePlayerResultsRepository,
        },
        { provide: getRepositoryToken(Duel), useValue: duelsRepository },
        { provide: RanksService, useValue: ranksService },
        { provide: AchievementsService, useValue: achievementsService },
        {
          provide: getRepositoryToken(BattleParticipationScoreLedger),
          useValue: participationLedgerRepository,
        },
        {
          provide: getRepositoryToken(BattleTeamScoreLedger),
          useValue: teamLedgerRepository,
        },
      ],
    }).compile();

    service = module.get<ScoringService>(ScoringService);
  });

  it('battle not found for preview', async () => {
    battlesRepository.findOne.mockResolvedValue(null);

    await expect(service.previewBattleScore('missing-battle')).rejects.toThrow(NotFoundException);
  });

  it('MASS_BATTLE with no results preview', async () => {
    battlesRepository.findOne.mockResolvedValue(massBattle);
    battlePlayerResultsRepository.find.mockResolvedValue([]);

    const result = await service.previewBattleScore(massBattleId);

    expect(result).toEqual({
      battleId: massBattleId,
      battleType: BattleType.MASS_BATTLE,
      participationDeltas: [],
      teamDeltas: [],
    });
  });

  it('DUEL_SESSION with winners preview', async () => {
    battlesRepository.findOne.mockResolvedValue(duelBattle);
    duelsRepository.find.mockResolvedValue([makeDuel('d1', 'p1'), makeDuel('d2', 'p1')]);

    const result = await service.previewBattleScore(duelBattleId);

    expect(result.participationDeltas).toEqual([
      {
        participationId: 'p1',
        killsDelta: 0,
        knifeKillsDelta: 0,
        survivalsDelta: 0,
        duelWinsDelta: 2,
        massBattleWinsDelta: 0,
        pointsDelta: 2,
      },
    ]);
  });

  it('apply on missing battle -> not found', async () => {
    battlesRepository.findOne.mockResolvedValue(null);

    await expect(service.applyBattleScore('missing-battle')).rejects.toThrow(NotFoundException);
  });

  it('apply on non-completed battle -> bad request', async () => {
    battlesRepository.findOne.mockResolvedValue({ ...massBattle, status: BattleStatus.DRAFT });

    await expect(service.applyBattleScore(massBattleId)).rejects.toThrow(BadRequestException);
  });

  it('apply on completed MASS_BATTLE with new deltas', async () => {
    const transactionState = setupTransactionalManager();

    battlesRepository.findOne.mockResolvedValue(massBattle);
    battlePlayerResultsRepository.find.mockResolvedValue([
      makeResult('r1', 'p1', 't1', 2, 1, true),
      makeResult('r2', 'p2', 't2', 1, 0, false),
    ]);

    const result = await service.applyBattleScore(massBattleId);

    expect(result.appliedParticipationCount).toBe(2);
    expect(result.appliedTeamCount).toBe(0);

    expect(transactionState.participationStats.p1).toEqual({
      kills: 2,
      knifeKills: 1,
      survivals: 1,
      duelWins: 0,
      massBattleWins: 0,
      points: 4,
    });
    expect(transactionState.participationStats.p2).toEqual({
      kills: 1,
      knifeKills: 0,
      survivals: 0,
      duelWins: 0,
      massBattleWins: 0,
      points: 1,
    });
    expect(ranksService.recomputeParticipationRanks).toHaveBeenCalledTimes(2);
    expect(ranksService.recomputeParticipationRanks).toHaveBeenCalledWith('p1');
    expect(ranksService.recomputeParticipationRanks).toHaveBeenCalledWith('p2');
    expect(achievementsService.unlockParticipationAchievements).toHaveBeenCalledTimes(2);
    expect(achievementsService.unlockParticipationAchievements).toHaveBeenCalledWith('p1');
    expect(achievementsService.unlockParticipationAchievements).toHaveBeenCalledWith('p2');
  });

  it('apply twice with same preview -> second apply makes zero net effect', async () => {
    const transactionState = setupTransactionalManager();

    battlesRepository.findOne.mockResolvedValue(massBattle);
    battlePlayerResultsRepository.find.mockResolvedValue([makeResult('r1', 'p1', 't1', 3, 1, true)]);

    await service.applyBattleScore(massBattleId);
    const afterFirstApply = JSON.parse(JSON.stringify(transactionState.participationStats));

    await service.applyBattleScore(massBattleId);

    expect(transactionState.participationStats).toEqual(afterFirstApply);
    expect(ranksService.recomputeParticipationRanks).toHaveBeenCalledTimes(2);
    expect(achievementsService.unlockParticipationAchievements).toHaveBeenCalledTimes(2);
  });

  it('apply does not invoke progression hooks when scoring transaction fails', async () => {
    battlesRepository.findOne.mockResolvedValue(massBattle);
    battlePlayerResultsRepository.find.mockResolvedValue([makeResult('r1', 'p1', 't1', 1, 0, false)]);
    battlesRepository.manager = {
      transaction: jest.fn(async () => {
        throw new Error('transaction failed');
      }),
    };

    await expect(service.applyBattleScore(massBattleId)).rejects.toThrow('transaction failed');
    expect(ranksService.recomputeParticipationRanks).not.toHaveBeenCalled();
    expect(achievementsService.unlockParticipationAchievements).not.toHaveBeenCalled();
  });

  it('apply after changing preview data -> only net difference is applied', async () => {
    const transactionState = setupTransactionalManager();

    battlesRepository.findOne.mockResolvedValue(massBattle);
    battlePlayerResultsRepository.find
      .mockResolvedValueOnce([makeResult('r1', 'p1', 't1', 2, 0, false)])
      .mockResolvedValueOnce([makeResult('r1', 'p1', 't1', 5, 1, true)]);

    await service.applyBattleScore(massBattleId);
    await service.applyBattleScore(massBattleId);

    expect(transactionState.participationStats.p1).toEqual({
      kills: 5,
      knifeKills: 1,
      survivals: 1,
      duelWins: 0,
      massBattleWins: 0,
      points: 7,
    });
  });

  it('apply on completed DUEL_SESSION', async () => {
    const transactionState = setupTransactionalManager();

    battlesRepository.findOne.mockResolvedValue(duelBattle);
    duelsRepository.find.mockResolvedValue([
      makeDuel('d1', 'p1'),
      makeDuel('d2', null),
      makeDuel('d3', 'p1'),
      makeDuel('d4', 'p2'),
    ]);

    const result = await service.applyBattleScore(duelBattleId);

    expect(result.battleType).toBe(BattleType.DUEL_SESSION);
    expect(result.appliedParticipationCount).toBe(2);
    expect(result.appliedTeamCount).toBe(0);
    expect(transactionState.participationStats.p1.points).toBe(2);
    expect(transactionState.participationStats.p1.duelWins).toBe(2);
    expect(transactionState.participationStats.p2.points).toBe(1);
    expect(transactionState.teamStats).toEqual({});
  });

  it('ledger rows are replaced with latest deltas', async () => {
    const transactionState = setupTransactionalManager();

    const battleWithWinner: Battle = { ...massBattle, winningTeamId: 't1' };

    battlesRepository.findOne.mockResolvedValue(battleWithWinner);
    battlePlayerResultsRepository.find
      .mockResolvedValueOnce([
        makeResult('r1', 'p1', 't1', 1, 0, false),
        makeResult('r2', 'p2', 't2', 1, 0, false),
      ])
      .mockResolvedValueOnce([makeResult('r3', 'p1', 't1', 4, 2, true)]);

    await service.applyBattleScore(massBattleId);
    expect(transactionState.participationLedgerStore).toHaveLength(2);
    expect(transactionState.teamLedgerStore).toHaveLength(1);

    await service.applyBattleScore(massBattleId);

    expect(transactionState.participationLedgerStore).toHaveLength(1);
    expect(transactionState.participationLedgerStore[0]).toMatchObject({
      battleId: massBattleId,
      participationId: 'p1',
      killsDelta: 4,
      knifeKillsDelta: 2,
      survivalsDelta: 1,
      pointsDelta: 9,
    });
    expect(transactionState.teamLedgerStore).toHaveLength(1);
    expect(transactionState.teamLedgerStore[0]).toMatchObject({
      battleId: massBattleId,
      teamId: 't1',
      teamPointsDelta: 3,
    });
  });
});

describe('ScoringService finalizeCampScore', () => {
  let service: ScoringService;
  let campsRepository: MockRepository;
  let battlesRepository: MockRepository;
  let campParticipationsRepository: MockRepository;
  let battlePlayerResultsRepository: MockRepository;
  let duelsRepository: MockRepository;
  let ranksService: ReturnType<typeof createRanksServiceMock>;
  let achievementsService: ReturnType<typeof createAchievementsServiceMock>;

  const campId = 'camp-1';

  const camp: Camp = {
    id: campId,
    campTypeId: 'camp-type-1',
    campType: {} as never,
    campTeams: [],
    title: 'Camp',
    year: 2026,
    startDate: '2026-08-01',
    endDate: '2026-08-07',
    location: null,
    description: null,
    logoUrl: null,
    coverImageUrl: null,
    status: CampStatus.ACTIVE,
    createdBy: null,
    createdByUser: null,
    finalizedAt: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  function createFinalizeManagerState(overrides?: {
    campTeams?: CampTeam[];
    participations?: CampParticipation[];
    assignments?: TeamAssignment[];
    ledger?: CampFinalizationLedger | null;
  }) {
    const campTeams = overrides?.campTeams ?? [];
    const participations = overrides?.participations ?? [];
    const assignments = overrides?.assignments ?? [];
    let ledger = overrides?.ledger ?? null;

    const increments: Array<{ id: string; property: string; value: number }> = [];
    let campUpdatePayload: Partial<Camp> | null = null;

    const manager = {
      findOne: jest.fn(async (entity: unknown) => {
        if (entity === CampFinalizationLedger) {
          return ledger;
        }
        return null;
      }),
      find: jest.fn(async (entity: unknown) => {
        if (entity === CampTeam) {
          return campTeams;
        }
        if (entity === CampParticipation) {
          return participations;
        }
        if (entity === TeamAssignment) {
          return assignments;
        }
        return [];
      }),
      increment: jest.fn(async (_entity: unknown, criteria: { id: string }, property: string, value: number) => {
        increments.push({ id: criteria.id, property, value });
      }),
      update: jest.fn(async (_entity: unknown, _criteria: { id: string }, partial: Partial<Camp>) => {
        campUpdatePayload = partial;
      }),
      insert: jest.fn(async (entity: unknown, payload: { campId: string; appliedAt: Date }) => {
        if (entity === CampFinalizationLedger) {
          ledger = {
            id: 'ledger-id',
            campId: payload.campId,
            camp: {} as never,
            appliedAt: payload.appliedAt,
            createdAt: payload.appliedAt,
            updatedAt: payload.appliedAt,
          };
        }
      }),
    };

    campsRepository.manager = {
      transaction: jest.fn(async (callback: (transactionManager: typeof manager) => Promise<unknown>) =>
        callback(manager),
      ),
    };

    return {
      manager,
      increments,
      getCampUpdatePayload: () => campUpdatePayload,
      getLedger: () => ledger,
    };
  }

  beforeEach(async () => {
    campsRepository = createRepositoryMock();
    battlesRepository = createRepositoryMock();
    campParticipationsRepository = createRepositoryMock();
    battlePlayerResultsRepository = createRepositoryMock();
    duelsRepository = createRepositoryMock();
    ranksService = createRanksServiceMock();
    achievementsService = createAchievementsServiceMock();
    ranksService.recomputeParticipationRanks.mockResolvedValue(undefined);
    achievementsService.unlockParticipationAchievements.mockResolvedValue(undefined);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ScoringService,
        { provide: getRepositoryToken(Battle), useValue: battlesRepository },
        { provide: getRepositoryToken(Camp), useValue: campsRepository },
        { provide: getRepositoryToken(CampParticipation), useValue: campParticipationsRepository },
        { provide: getRepositoryToken(BattlePlayerResult), useValue: battlePlayerResultsRepository },
        { provide: getRepositoryToken(Duel), useValue: duelsRepository },
        { provide: RanksService, useValue: ranksService },
        { provide: AchievementsService, useValue: achievementsService },
      ],
    }).compile();

    service = module.get<ScoringService>(ScoringService);
  });

  it('finalize on missing camp -> not found', async () => {
    campsRepository.findOne.mockResolvedValue(null);

    await expect(service.finalizeCampScore(campId)).rejects.toThrow(NotFoundException);
  });

  it('finalize with no team positions -> bad request', async () => {
    campsRepository.findOne.mockResolvedValue(camp);
    createFinalizeManagerState({
      campTeams: [
        {
          id: 't1',
          campId,
          camp: {} as never,
          name: 'A',
          color: null,
          logoUrl: null,
          teamPoints: 0,
          finalPosition: null,
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ],
    });

    await expect(service.finalizeCampScore(campId)).rejects.toThrow(BadRequestException);
  });

  it('finalize with duplicate final positions -> bad request', async () => {
    campsRepository.findOne.mockResolvedValue(camp);
    createFinalizeManagerState({
      campTeams: [
        {
          id: 't1',
          campId,
          camp: {} as never,
          name: 'A',
          color: null,
          logoUrl: null,
          teamPoints: 0,
          finalPosition: 1,
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 't2',
          campId,
          camp: {} as never,
          name: 'B',
          color: null,
          logoUrl: null,
          teamPoints: 0,
          finalPosition: 1,
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ],
    });

    await expect(service.finalizeCampScore(campId)).rejects.toThrow(BadRequestException);
  });

  it('finalize success with 1st/2nd/3rd/4th+ bonuses and no-assignment participation', async () => {
    campsRepository.findOne.mockResolvedValue(camp);
    const state = createFinalizeManagerState({
      campTeams: [
        {
          id: 't1',
          campId,
          camp: {} as never,
          name: 'T1',
          color: null,
          logoUrl: null,
          teamPoints: 0,
          finalPosition: 1,
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 't2',
          campId,
          camp: {} as never,
          name: 'T2',
          color: null,
          logoUrl: null,
          teamPoints: 0,
          finalPosition: 2,
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 't3',
          campId,
          camp: {} as never,
          name: 'T3',
          color: null,
          logoUrl: null,
          teamPoints: 0,
          finalPosition: 3,
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 't4',
          campId,
          camp: {} as never,
          name: 'T4',
          color: null,
          logoUrl: null,
          teamPoints: 0,
          finalPosition: 4,
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ],
      participations: [
        { id: 'p1', campId, camp: {} as never, playerId: 'a', player: {} as never, kills: 0, knifeKills: 0, survivals: 0, duelWins: 0, massBattleWins: 0, points: 0, createdAt: new Date(), updatedAt: new Date() },
        { id: 'p2', campId, camp: {} as never, playerId: 'b', player: {} as never, kills: 0, knifeKills: 0, survivals: 0, duelWins: 0, massBattleWins: 0, points: 0, createdAt: new Date(), updatedAt: new Date() },
        { id: 'p3', campId, camp: {} as never, playerId: 'c', player: {} as never, kills: 0, knifeKills: 0, survivals: 0, duelWins: 0, massBattleWins: 0, points: 0, createdAt: new Date(), updatedAt: new Date() },
        { id: 'p4', campId, camp: {} as never, playerId: 'd', player: {} as never, kills: 0, knifeKills: 0, survivals: 0, duelWins: 0, massBattleWins: 0, points: 0, createdAt: new Date(), updatedAt: new Date() },
        { id: 'p5', campId, camp: {} as never, playerId: 'e', player: {} as never, kills: 0, knifeKills: 0, survivals: 0, duelWins: 0, massBattleWins: 0, points: 0, createdAt: new Date(), updatedAt: new Date() },
      ],
      assignments: [
        { id: 'a1', participationId: 'p1', participation: {} as never, teamId: 't1', team: {} as never, assignedAt: new Date('2026-08-10T10:00:00Z'), assignedBy: null, assignedByUser: null, note: null, createdAt: new Date('2026-08-10T10:00:00Z'), updatedAt: new Date() },
        { id: 'a2', participationId: 'p2', participation: {} as never, teamId: 't2', team: {} as never, assignedAt: new Date('2026-08-10T10:00:00Z'), assignedBy: null, assignedByUser: null, note: null, createdAt: new Date('2026-08-10T10:00:00Z'), updatedAt: new Date() },
        { id: 'a3', participationId: 'p3', participation: {} as never, teamId: 't3', team: {} as never, assignedAt: new Date('2026-08-10T10:00:00Z'), assignedBy: null, assignedByUser: null, note: null, createdAt: new Date('2026-08-10T10:00:00Z'), updatedAt: new Date() },
        { id: 'a4', participationId: 'p4', participation: {} as never, teamId: 't4', team: {} as never, assignedAt: new Date('2026-08-10T10:00:00Z'), assignedBy: null, assignedByUser: null, note: null, createdAt: new Date('2026-08-10T10:00:00Z'), updatedAt: new Date() },
      ],
    });
    campParticipationsRepository.find.mockResolvedValue([
      { id: 'p1' },
      { id: 'p2' },
      { id: 'p3' },
      { id: 'p4' },
      { id: 'p5' },
    ]);

    const result = await service.finalizeCampScore(campId);

    expect(result).toMatchObject({
      campId,
      finalized: true,
      alreadyFinalized: false,
      appliedParticipationCount: 4,
    });
    expect(state.increments).toEqual([
      { id: 'p1', property: 'points', value: 7 },
      { id: 'p2', property: 'points', value: 5 },
      { id: 'p3', property: 'points', value: 3 },
      { id: 'p4', property: 'points', value: 1 },
    ]);
    expect(achievementsService.unlockParticipationAchievements).toHaveBeenCalledTimes(5);
    expect(achievementsService.unlockParticipationAchievements).toHaveBeenCalledWith('p1');
    expect(achievementsService.unlockParticipationAchievements).toHaveBeenCalledWith('p2');
    expect(achievementsService.unlockParticipationAchievements).toHaveBeenCalledWith('p3');
    expect(achievementsService.unlockParticipationAchievements).toHaveBeenCalledWith('p4');
    expect(achievementsService.unlockParticipationAchievements).toHaveBeenCalledWith('p5');
    expect(ranksService.recomputeParticipationRanks).not.toHaveBeenCalled();
  });

  it('finalize twice -> second call is idempotent and does not add points again', async () => {
    campsRepository.findOne
      .mockResolvedValueOnce(camp)
      .mockResolvedValueOnce({ ...camp, status: CampStatus.FINISHED });

    const state = createFinalizeManagerState({
      campTeams: [
        {
          id: 't1',
          campId,
          camp: {} as never,
          name: 'T1',
          color: null,
          logoUrl: null,
          teamPoints: 0,
          finalPosition: 1,
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ],
      participations: [
        { id: 'p1', campId, camp: {} as never, playerId: 'a', player: {} as never, kills: 0, knifeKills: 0, survivals: 0, duelWins: 0, massBattleWins: 0, points: 0, createdAt: new Date(), updatedAt: new Date() },
      ],
      assignments: [
        { id: 'a1', participationId: 'p1', participation: {} as never, teamId: 't1', team: {} as never, assignedAt: new Date(), assignedBy: null, assignedByUser: null, note: null, createdAt: new Date(), updatedAt: new Date() },
      ],
      ledger: null,
    });
    campParticipationsRepository.find.mockResolvedValue([{ id: 'p1' }]);

    const first = await service.finalizeCampScore(campId);
    expect(first.alreadyFinalized).toBe(false);
    expect(state.increments).toHaveLength(1);

    const second = await service.finalizeCampScore(campId);
    expect(second.alreadyFinalized).toBe(true);
    expect(second.appliedParticipationCount).toBe(0);
    expect(state.increments).toHaveLength(1);
    expect(achievementsService.unlockParticipationAchievements).toHaveBeenCalledTimes(2);
    expect(achievementsService.unlockParticipationAchievements).toHaveBeenNthCalledWith(1, 'p1');
    expect(achievementsService.unlockParticipationAchievements).toHaveBeenNthCalledWith(2, 'p1');
    expect(ranksService.recomputeParticipationRanks).not.toHaveBeenCalled();
  });

  it('camp status becomes FINISHED, finalizedAt is set, and ledger row is created', async () => {
    campsRepository.findOne.mockResolvedValue(camp);
    const state = createFinalizeManagerState({
      campTeams: [
        {
          id: 't1',
          campId,
          camp: {} as never,
          name: 'T1',
          color: null,
          logoUrl: null,
          teamPoints: 0,
          finalPosition: 1,
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ],
      participations: [
        { id: 'p1', campId, camp: {} as never, playerId: 'a', player: {} as never, kills: 0, knifeKills: 0, survivals: 0, duelWins: 0, massBattleWins: 0, points: 0, createdAt: new Date(), updatedAt: new Date() },
      ],
      assignments: [
        { id: 'a1', participationId: 'p1', participation: {} as never, teamId: 't1', team: {} as never, assignedAt: new Date(), assignedBy: null, assignedByUser: null, note: null, createdAt: new Date(), updatedAt: new Date() },
      ],
    });
    campParticipationsRepository.find.mockResolvedValue([{ id: 'p1' }]);

    await service.finalizeCampScore(campId);

    expect(state.getCampUpdatePayload()).toEqual(
      expect.objectContaining({ status: CampStatus.FINISHED, finalizedAt: expect.any(Date) }),
    );
    expect(state.getLedger()).not.toBeNull();
  });

  it('finalize does not invoke achievement hooks when finalization transaction fails', async () => {
    campsRepository.findOne.mockResolvedValue(camp);
    campsRepository.manager = {
      transaction: jest.fn(async () => {
        throw new Error('finalize failed');
      }),
    };

    await expect(service.finalizeCampScore(campId)).rejects.toThrow('finalize failed');
    expect(achievementsService.unlockParticipationAchievements).not.toHaveBeenCalled();
    expect(ranksService.recomputeParticipationRanks).not.toHaveBeenCalled();
  });
});
