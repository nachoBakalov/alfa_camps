import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { AchievementConditionType } from '../achievements/enums/achievement-condition-type.enum';
import { PlayerAchievement } from '../achievements/entities/player-achievement.entity';
import { CampParticipation } from '../camp-participations/entities/camp-participation.entity';
import { CampStatus } from '../camps/enums/camp-status.enum';
import { MedalType } from '../medals/enums/medal-type.enum';
import { PlayerMedal } from '../medals/entities/player-medal.entity';
import { Player } from '../players/entities/player.entity';
import { PlayerRank } from '../ranks/entities/player-rank.entity';
import { TeamAssignment } from '../team-assignments/entities/team-assignment.entity';
import { PlayerProfilesService } from './player-profiles.service';

type MockRepository = {
  findOne: jest.Mock;
  find: jest.Mock;
};

const createRepositoryMock = (): MockRepository => ({
  findOne: jest.fn(),
  find: jest.fn(),
});

describe('PlayerProfilesService', () => {
  let service: PlayerProfilesService;
  let playersRepository: MockRepository;
  let campParticipationsRepository: MockRepository;
  let teamAssignmentsRepository: MockRepository;
  let playerRanksRepository: MockRepository;
  let playerAchievementsRepository: MockRepository;
  let playerMedalsRepository: MockRepository;

  const playerId = 'player-1';

  beforeEach(async () => {
    playersRepository = createRepositoryMock();
    campParticipationsRepository = createRepositoryMock();
    teamAssignmentsRepository = createRepositoryMock();
    playerRanksRepository = createRepositoryMock();
    playerAchievementsRepository = createRepositoryMock();
    playerMedalsRepository = createRepositoryMock();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PlayerProfilesService,
        { provide: getRepositoryToken(Player), useValue: playersRepository },
        { provide: getRepositoryToken(CampParticipation), useValue: campParticipationsRepository },
        { provide: getRepositoryToken(TeamAssignment), useValue: teamAssignmentsRepository },
        { provide: getRepositoryToken(PlayerRank), useValue: playerRanksRepository },
        { provide: getRepositoryToken(PlayerAchievement), useValue: playerAchievementsRepository },
        { provide: getRepositoryToken(PlayerMedal), useValue: playerMedalsRepository },
      ],
    }).compile();

    service = module.get<PlayerProfilesService>(PlayerProfilesService);
  });

  function mockPlayer() {
    playersRepository.findOne.mockResolvedValue({
      id: playerId,
      firstName: 'Ivan',
      lastName: 'Petrov',
      nickname: 'vanko',
      avatarUrl: null,
      isActive: true,
    });
  }

  function makeParticipation(
    id: string,
    stats: { points: number; kills: number; knifeKills: number; survivals: number; duelWins: number; massBattleWins: number },
    camp: { id: string; title: string; year: number; status: CampStatus; campTypeId: string; campTypeName: string },
  ) {
    return {
      id,
      campId: camp.id,
      camp: {
        id: camp.id,
        title: camp.title,
        year: camp.year,
        status: camp.status,
        startDate: '2026-08-01',
        campTypeId: camp.campTypeId,
        campType: { name: camp.campTypeName },
      },
      ...stats,
    };
  }

  it('missing player -> not found', async () => {
    playersRepository.findOne.mockResolvedValue(null);

    await expect(service.getPlayerProfile(playerId)).rejects.toThrow(NotFoundException);
  });

  it('profile with no participations', async () => {
    mockPlayer();
    campParticipationsRepository.find.mockResolvedValue([]);

    const result = await service.getPlayerProfile(playerId);

    expect(result.playerId).toBe(playerId);
    expect(result.totalParticipations).toBe(0);
    expect(result.totalPoints).toBe(0);
    expect(result.totalKills).toBe(0);
    expect(result.participations).toEqual([]);
    expect(teamAssignmentsRepository.find).not.toHaveBeenCalled();
  });

  it('profile with participations and aggregated totals', async () => {
    mockPlayer();
    campParticipationsRepository.find.mockResolvedValue([
      makeParticipation(
        'p1',
        { points: 10, kills: 4, knifeKills: 1, survivals: 2, duelWins: 3, massBattleWins: 1 },
        { id: 'camp-1', title: 'Camp A', year: 2026, status: CampStatus.ACTIVE, campTypeId: 'ct-1', campTypeName: 'Summer' },
      ),
      makeParticipation(
        'p2',
        { points: 5, kills: 2, knifeKills: 0, survivals: 1, duelWins: 0, massBattleWins: 0 },
        { id: 'camp-2', title: 'Camp B', year: 2025, status: CampStatus.FINISHED, campTypeId: 'ct-2', campTypeName: 'Winter' },
      ),
    ]);
    teamAssignmentsRepository.find.mockResolvedValue([]);
    playerRanksRepository.find.mockResolvedValue([]);
    playerAchievementsRepository.find.mockResolvedValue([]);
    playerMedalsRepository.find.mockResolvedValue([]);

    const result = await service.getPlayerProfile(playerId);

    expect(result.totalParticipations).toBe(2);
    expect(result.totalPoints).toBe(15);
    expect(result.totalKills).toBe(6);
    expect(result.totalKnifeKills).toBe(1);
    expect(result.totalSurvivals).toBe(3);
    expect(result.totalDuelWins).toBe(3);
    expect(result.totalMassBattleWins).toBe(1);
  });

  it('current team resolution uses latest assignment', async () => {
    mockPlayer();
    campParticipationsRepository.find.mockResolvedValue([
      makeParticipation(
        'p1',
        { points: 1, kills: 1, knifeKills: 0, survivals: 0, duelWins: 0, massBattleWins: 0 },
        { id: 'camp-1', title: 'Camp A', year: 2026, status: CampStatus.ACTIVE, campTypeId: 'ct-1', campTypeName: 'Summer' },
      ),
    ]);
    teamAssignmentsRepository.find.mockResolvedValue([
      {
        id: 'a-new',
        participationId: 'p1',
        team: { id: 't2', name: 'Blue', color: '#00f', logoUrl: null },
        assignedAt: new Date('2026-08-03T10:00:00Z'),
        createdAt: new Date('2026-08-03T10:00:00Z'),
      },
      {
        id: 'a-old',
        participationId: 'p1',
        team: { id: 't1', name: 'Red', color: '#f00', logoUrl: null },
        assignedAt: new Date('2026-08-01T10:00:00Z'),
        createdAt: new Date('2026-08-01T10:00:00Z'),
      },
    ]);
    playerRanksRepository.find.mockResolvedValue([]);
    playerAchievementsRepository.find.mockResolvedValue([]);
    playerMedalsRepository.find.mockResolvedValue([]);

    const result = await service.getPlayerProfile(playerId);

    expect(result.participations[0].currentTeam).toEqual({
      teamId: 't2',
      name: 'Blue',
      color: '#00f',
      logoUrl: null,
    });
  });

  it('participations are sorted correctly', async () => {
    mockPlayer();
    campParticipationsRepository.find.mockResolvedValue([]);

    await service.getPlayerProfile(playerId);

    expect(campParticipationsRepository.find).toHaveBeenCalledWith(
      expect.objectContaining({
        order: {
          camp: {
            year: 'DESC',
            startDate: 'DESC',
          },
          createdAt: 'DESC',
        },
      }),
    );
  });

  it('ranks are included', async () => {
    mockPlayer();
    campParticipationsRepository.find.mockResolvedValue([
      makeParticipation(
        'p1',
        { points: 1, kills: 1, knifeKills: 0, survivals: 0, duelWins: 0, massBattleWins: 0 },
        { id: 'camp-1', title: 'Camp A', year: 2026, status: CampStatus.ACTIVE, campTypeId: 'ct-1', campTypeName: 'Summer' },
      ),
    ]);
    teamAssignmentsRepository.find.mockResolvedValue([]);
    playerRanksRepository.find.mockResolvedValue([
      {
        participationId: 'p1',
        categoryId: 'cat-1',
        category: { code: 'KILLS_RANK', name: 'Kills' },
        rankDefinitionId: 'rd-1',
        rankDefinition: { name: 'Bronze', iconUrl: null, threshold: 10, rankOrder: 1 },
        unlockedAt: new Date('2026-08-02T10:00:00Z'),
      },
    ]);
    playerAchievementsRepository.find.mockResolvedValue([]);
    playerMedalsRepository.find.mockResolvedValue([]);

    const result = await service.getPlayerProfile(playerId);

    expect(result.participations[0].ranks).toEqual([
      {
        categoryId: 'cat-1',
        categoryCode: 'KILLS_RANK',
        categoryName: 'Kills',
        rankDefinitionId: 'rd-1',
        rankName: 'Bronze',
        iconUrl: null,
        threshold: 10,
        rankOrder: 1,
        unlockedAt: new Date('2026-08-02T10:00:00Z'),
      },
    ]);
  });

  it('achievements are included', async () => {
    mockPlayer();
    campParticipationsRepository.find.mockResolvedValue([
      makeParticipation(
        'p1',
        { points: 1, kills: 1, knifeKills: 0, survivals: 0, duelWins: 0, massBattleWins: 0 },
        { id: 'camp-1', title: 'Camp A', year: 2026, status: CampStatus.ACTIVE, campTypeId: 'ct-1', campTypeName: 'Summer' },
      ),
    ]);
    teamAssignmentsRepository.find.mockResolvedValue([]);
    playerRanksRepository.find.mockResolvedValue([]);
    playerAchievementsRepository.find.mockResolvedValue([
      {
        participationId: 'p1',
        achievementId: 'a-1',
        achievement: {
          name: 'First Blood',
          description: null,
          iconUrl: null,
          conditionType: AchievementConditionType.KILLS,
          threshold: 1,
        },
        unlockedAt: new Date('2026-08-02T10:00:00Z'),
      },
    ]);
    playerMedalsRepository.find.mockResolvedValue([]);

    const result = await service.getPlayerProfile(playerId);

    expect(result.participations[0].achievements).toEqual([
      {
        achievementId: 'a-1',
        name: 'First Blood',
        description: null,
        iconUrl: null,
        conditionType: AchievementConditionType.KILLS,
        threshold: 1,
        unlockedAt: new Date('2026-08-02T10:00:00Z'),
      },
    ]);
  });

  it('medals are included', async () => {
    mockPlayer();
    campParticipationsRepository.find.mockResolvedValue([
      makeParticipation(
        'p1',
        { points: 1, kills: 1, knifeKills: 0, survivals: 0, duelWins: 0, massBattleWins: 0 },
        { id: 'camp-1', title: 'Camp A', year: 2026, status: CampStatus.ACTIVE, campTypeId: 'ct-1', campTypeName: 'Summer' },
      ),
    ]);
    teamAssignmentsRepository.find.mockResolvedValue([]);
    playerRanksRepository.find.mockResolvedValue([]);
    playerAchievementsRepository.find.mockResolvedValue([]);
    playerMedalsRepository.find.mockResolvedValue([
      {
        id: 'pm-1',
        participationId: 'p1',
        medalId: 'm-1',
        medal: {
          name: 'MVP',
          description: null,
          iconUrl: null,
          type: MedalType.MANUAL,
        },
        note: 'Great game',
        awardedAt: new Date('2026-08-04T10:00:00Z'),
      },
    ]);

    const result = await service.getPlayerProfile(playerId);

    expect(result.participations[0].medals).toEqual([
      {
        playerMedalId: 'pm-1',
        medalId: 'm-1',
        name: 'MVP',
        description: null,
        iconUrl: null,
        type: MedalType.MANUAL,
        note: 'Great game',
        awardedAt: new Date('2026-08-04T10:00:00Z'),
      },
    ]);
  });
});
