import { ConflictException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { QueryFailedError } from 'typeorm';
import { CampParticipation } from '../camp-participations/entities/camp-participation.entity';
import { AchievementsService } from './achievements.service';
import { AchievementDefinition } from './entities/achievement-definition.entity';
import { PlayerAchievement } from './entities/player-achievement.entity';
import { AchievementConditionType } from './enums/achievement-condition-type.enum';

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
    constraint: 'UQ_achievement_definitions_condition_threshold_name',
  } as unknown as Error);

describe('AchievementsService', () => {
  let service: AchievementsService;
  let definitionsRepository: MockRepository;
  let playerAchievementsRepository: MockRepository;
  let participationsRepository: MockRepository;

  const participation: CampParticipation = {
    id: 'participation-id',
    campId: 'camp-id',
    camp: {} as never,
    playerId: 'player-id',
    player: {} as never,
    kills: 20,
    knifeKills: 0,
    survivals: 8,
    duelWins: 4,
    massBattleWins: 0,
    points: 42,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const definition: AchievementDefinition = {
    id: 'a1',
    name: 'Killer',
    description: null,
    iconUrl: null,
    conditionType: AchievementConditionType.KILLS,
    threshold: 10,
    playerAchievements: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    definitionsRepository = createRepositoryMock();
    playerAchievementsRepository = createRepositoryMock();
    participationsRepository = createRepositoryMock();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AchievementsService,
        {
          provide: getRepositoryToken(AchievementDefinition),
          useValue: definitionsRepository,
        },
        {
          provide: getRepositoryToken(PlayerAchievement),
          useValue: playerAchievementsRepository,
        },
        {
          provide: getRepositoryToken(CampParticipation),
          useValue: participationsRepository,
        },
      ],
    }).compile();

    service = module.get<AchievementsService>(AchievementsService);
  });

  it('create definition success', async () => {
    definitionsRepository.create.mockReturnValue(definition);
    definitionsRepository.save.mockResolvedValue(definition);

    const result = await service.createDefinition({
      name: 'Killer',
      conditionType: AchievementConditionType.KILLS,
      threshold: 10,
    });

    expect(result).toEqual(definition);
  });

  it('create definition duplicate -> conflict', async () => {
    definitionsRepository.create.mockReturnValue(definition);
    definitionsRepository.save.mockRejectedValue(createUniqueError());

    await expect(
      service.createDefinition({
        name: 'Killer',
        conditionType: AchievementConditionType.KILLS,
        threshold: 10,
      }),
    ).rejects.toThrow(ConflictException);
  });

  it('findAllDefinitions', async () => {
    definitionsRepository.find.mockResolvedValue([definition]);

    const result = await service.findAllDefinitions();

    expect(result).toEqual([definition]);
  });

  it('findOneDefinition success', async () => {
    definitionsRepository.findOne.mockResolvedValue(definition);

    const result = await service.findOneDefinition(definition.id);

    expect(result).toEqual(definition);
  });

  it('findOneDefinition not found', async () => {
    definitionsRepository.findOne.mockResolvedValue(null);

    await expect(service.findOneDefinition('missing')).rejects.toThrow(NotFoundException);
  });

  it('updateDefinition success', async () => {
    definitionsRepository.findOne.mockResolvedValue(definition);
    definitionsRepository.merge.mockReturnValue({ ...definition, threshold: 11 });
    definitionsRepository.save.mockResolvedValue({ ...definition, threshold: 11 });

    const result = await service.updateDefinition(definition.id, { threshold: 11 });

    expect(result.threshold).toBe(11);
  });

  it('updateDefinition not found', async () => {
    definitionsRepository.findOne.mockResolvedValue(null);

    await expect(service.updateDefinition('missing', { threshold: 11 })).rejects.toThrow(
      NotFoundException,
    );
  });

  it('removeDefinition success', async () => {
    definitionsRepository.findOne.mockResolvedValue(definition);

    await service.removeDefinition(definition.id);

    expect(definitionsRepository.remove).toHaveBeenCalledWith(definition);
  });

  it('removeDefinition not found', async () => {
    definitionsRepository.findOne.mockResolvedValue(null);

    await expect(service.removeDefinition('missing')).rejects.toThrow(NotFoundException);
  });

  it('unlock with missing participation -> not found', async () => {
    participationsRepository.findOne.mockResolvedValue(null);

    await expect(service.unlockParticipationAchievements('missing')).rejects.toThrow(
      NotFoundException,
    );
  });

  it('unlock achievements for kills', async () => {
    participationsRepository.findOne.mockResolvedValue(participation);
    definitionsRepository.find.mockResolvedValue([
      {
        ...definition,
        id: 'k1',
        conditionType: AchievementConditionType.KILLS,
        threshold: 10,
      },
    ]);
    playerAchievementsRepository.find.mockResolvedValue([]);
    playerAchievementsRepository.create.mockImplementation((payload) => payload);
    playerAchievementsRepository.save.mockImplementation(async (payload) => payload);

    const result = await service.unlockParticipationAchievements(participation.id);

    expect(result.unlockedCount).toBe(1);
    expect(result.totalEligibleCount).toBe(1);
    expect(result.unlockedAchievementIds).toEqual(['k1']);
  });

  it('unlock achievements for survivals', async () => {
    participationsRepository.findOne.mockResolvedValue(participation);
    definitionsRepository.find.mockResolvedValue([
      {
        ...definition,
        id: 's1',
        conditionType: AchievementConditionType.SURVIVALS,
        threshold: 5,
      },
    ]);
    playerAchievementsRepository.find.mockResolvedValue([]);
    playerAchievementsRepository.create.mockImplementation((payload) => payload);
    playerAchievementsRepository.save.mockImplementation(async (payload) => payload);

    const result = await service.unlockParticipationAchievements(participation.id);

    expect(result.unlockedAchievementIds).toEqual(['s1']);
  });

  it('unlock achievements for duel wins', async () => {
    participationsRepository.findOne.mockResolvedValue(participation);
    definitionsRepository.find.mockResolvedValue([
      {
        ...definition,
        id: 'd1',
        conditionType: AchievementConditionType.DUEL_WINS,
        threshold: 4,
      },
    ]);
    playerAchievementsRepository.find.mockResolvedValue([]);
    playerAchievementsRepository.create.mockImplementation((payload) => payload);
    playerAchievementsRepository.save.mockImplementation(async (payload) => payload);

    const result = await service.unlockParticipationAchievements(participation.id);

    expect(result.unlockedAchievementIds).toEqual(['d1']);
  });

  it('unlock achievements for points', async () => {
    participationsRepository.findOne.mockResolvedValue(participation);
    definitionsRepository.find.mockResolvedValue([
      {
        ...definition,
        id: 'p1',
        conditionType: AchievementConditionType.POINTS,
        threshold: 40,
      },
    ]);
    playerAchievementsRepository.find.mockResolvedValue([]);
    playerAchievementsRepository.create.mockImplementation((payload) => payload);
    playerAchievementsRepository.save.mockImplementation(async (payload) => payload);

    const result = await service.unlockParticipationAchievements(participation.id);

    expect(result.unlockedAchievementIds).toEqual(['p1']);
  });

  it('unlock is idempotent and does not duplicate rows', async () => {
    participationsRepository.findOne.mockResolvedValue(participation);
    definitionsRepository.find.mockResolvedValue([
      {
        ...definition,
        id: 'k1',
        conditionType: AchievementConditionType.KILLS,
        threshold: 10,
      },
    ]);
    playerAchievementsRepository.find.mockResolvedValue([
      {
        id: 'pa1',
        participationId: participation.id,
        participation: {} as never,
        achievementId: 'k1',
        achievement: {} as never,
        unlockedAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);

    const result = await service.unlockParticipationAchievements(participation.id);

    expect(result.unlockedCount).toBe(0);
    expect(playerAchievementsRepository.save).not.toHaveBeenCalled();
  });

  it('findAchievementsByParticipation', async () => {
    participationsRepository.findOne.mockResolvedValue(participation);
    playerAchievementsRepository.find.mockResolvedValue([
      {
        id: 'pa1',
        participationId: participation.id,
        participation: {} as never,
        achievementId: 'k1',
        achievement: {} as never,
        unlockedAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);

    const result = await service.findAchievementsByParticipation(participation.id);

    expect(result).toHaveLength(1);
  });
});
