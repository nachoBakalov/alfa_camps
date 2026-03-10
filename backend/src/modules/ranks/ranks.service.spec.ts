import { ConflictException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { QueryFailedError } from 'typeorm';
import { CampParticipation } from '../camp-participations/entities/camp-participation.entity';
import { PlayerRank } from './entities/player-rank.entity';
import { RankCategory } from './entities/rank-category.entity';
import { RankDefinition } from './entities/rank-definition.entity';
import { RanksService } from './ranks.service';

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

const createUniqueError = (constraint: string): QueryFailedError =>
  new QueryFailedError('QUERY', [], {
    code: '23505',
    constraint,
  } as unknown as Error);

describe('RanksService', () => {
  let service: RanksService;
  let categoriesRepository: MockRepository;
  let definitionsRepository: MockRepository;
  let playerRanksRepository: MockRepository;
  let participationsRepository: MockRepository;

  const category: RankCategory = {
    id: 'category-id',
    code: 'KILLS_RANK',
    name: 'Kills',
    definitions: [],
    playerRanks: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const participation: CampParticipation = {
    id: 'participation-id',
    campId: 'camp-id',
    camp: {} as never,
    playerId: 'player-id',
    player: {} as never,
    kills: 12,
    knifeKills: 0,
    survivals: 0,
    duelWins: 3,
    massBattleWins: 2,
    points: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const definitionBronze: RankDefinition = {
    id: 'def-1',
    categoryId: 'category-id',
    category,
    name: 'Bronze',
    iconUrl: null,
    threshold: 5,
    rankOrder: 1,
    playerRanks: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const definitionSilver: RankDefinition = {
    ...definitionBronze,
    id: 'def-2',
    threshold: 10,
    rankOrder: 2,
  };

  beforeEach(async () => {
    categoriesRepository = createRepositoryMock();
    definitionsRepository = createRepositoryMock();
    playerRanksRepository = createRepositoryMock();
    participationsRepository = createRepositoryMock();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RanksService,
        { provide: getRepositoryToken(RankCategory), useValue: categoriesRepository },
        { provide: getRepositoryToken(RankDefinition), useValue: definitionsRepository },
        { provide: getRepositoryToken(PlayerRank), useValue: playerRanksRepository },
        {
          provide: getRepositoryToken(CampParticipation),
          useValue: participationsRepository,
        },
      ],
    }).compile();

    service = module.get<RanksService>(RanksService);
  });

  it('create category success', async () => {
    categoriesRepository.create.mockReturnValue(category);
    categoriesRepository.save.mockResolvedValue(category);

    const result = await service.createCategory({ code: 'KILLS_RANK', name: 'Kills' });

    expect(result).toEqual(category);
  });

  it('create category duplicate code -> conflict', async () => {
    categoriesRepository.create.mockReturnValue(category);
    categoriesRepository.save.mockRejectedValue(createUniqueError('UQ_rank_categories_code'));

    await expect(
      service.createCategory({ code: 'KILLS_RANK', name: 'Kills' }),
    ).rejects.toThrow(new ConflictException('Rank category code already exists'));
  });

  it('create definition success', async () => {
    categoriesRepository.findOne.mockResolvedValue(category);
    definitionsRepository.create.mockReturnValue(definitionBronze);
    definitionsRepository.save.mockResolvedValue(definitionBronze);

    const result = await service.createDefinition({
      categoryId: category.id,
      threshold: 5,
      rankOrder: 1,
      name: 'Bronze',
    });

    expect(result).toEqual(definitionBronze);
  });

  it('create definition with missing category -> not found', async () => {
    categoriesRepository.findOne.mockResolvedValue(null);

    await expect(
      service.createDefinition({
        categoryId: 'missing-category',
        threshold: 5,
        rankOrder: 1,
      }),
    ).rejects.toThrow(NotFoundException);
  });

  it('create definition duplicate threshold/rankOrder within category -> conflict', async () => {
    categoriesRepository.findOne.mockResolvedValue(category);
    definitionsRepository.create.mockReturnValue(definitionBronze);
    definitionsRepository.save.mockRejectedValue(
      createUniqueError('UQ_rank_definitions_category_threshold'),
    );

    await expect(
      service.createDefinition({
        categoryId: category.id,
        threshold: 5,
        rankOrder: 1,
      }),
    ).rejects.toThrow(
      new ConflictException('Rank definition threshold already exists in this category'),
    );

    definitionsRepository.save.mockRejectedValue(
      createUniqueError('UQ_rank_definitions_category_rank_order'),
    );

    await expect(
      service.createDefinition({
        categoryId: category.id,
        threshold: 6,
        rankOrder: 1,
      }),
    ).rejects.toThrow(
      new ConflictException('Rank definition rankOrder already exists in this category'),
    );
  });

  it('findDefinitionsByCategory', async () => {
    categoriesRepository.findOne.mockResolvedValue(category);
    definitionsRepository.find.mockResolvedValue([definitionBronze, definitionSilver]);

    const result = await service.findDefinitionsByCategory(category.id);

    expect(definitionsRepository.find).toHaveBeenCalledWith({
      where: { categoryId: category.id },
      order: { rankOrder: 'ASC', threshold: 'ASC' },
    });
    expect(result).toEqual([definitionBronze, definitionSilver]);
  });

  it('CRUD not found cases', async () => {
    categoriesRepository.findOne.mockResolvedValue(null);
    await expect(service.findOneCategory('missing')).rejects.toThrow(NotFoundException);
    await expect(service.updateCategory('missing', { name: 'X' })).rejects.toThrow(NotFoundException);
    await expect(service.removeCategory('missing')).rejects.toThrow(NotFoundException);

    definitionsRepository.findOne.mockResolvedValue(null);
    await expect(service.findOneDefinition('missing')).rejects.toThrow(NotFoundException);
    await expect(service.updateDefinition('missing', { name: 'X' })).rejects.toThrow(
      NotFoundException,
    );
    await expect(service.removeDefinition('missing')).rejects.toThrow(NotFoundException);
  });

  it('recompute with missing participation -> not found', async () => {
    participationsRepository.findOne.mockResolvedValue(null);

    await expect(service.recomputeParticipationRanks('missing')).rejects.toThrow(NotFoundException);
  });

  it('recompute creates player rank for kills category', async () => {
    participationsRepository.findOne.mockResolvedValue(participation);
    categoriesRepository.find.mockResolvedValue([category]);
    playerRanksRepository.find.mockResolvedValue([]);
    definitionsRepository.find.mockResolvedValue([definitionSilver, definitionBronze]);
    playerRanksRepository.create.mockImplementation((payload) => payload);
    playerRanksRepository.save.mockImplementation(async (payload) => payload);

    const result = await service.recomputeParticipationRanks(participation.id);

    expect(result.createdRanksCount).toBe(1);
    expect(result.updatedRanks).toEqual([
      { categoryCode: 'KILLS_RANK', rankDefinitionId: definitionSilver.id },
    ]);
  });

  it('recompute updates existing player rank when threshold increases', async () => {
    const existingRank: PlayerRank = {
      id: 'pr-1',
      participationId: participation.id,
      participation: {} as never,
      categoryId: category.id,
      category,
      rankDefinitionId: definitionBronze.id,
      rankDefinition: definitionBronze,
      unlockedAt: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    participationsRepository.findOne.mockResolvedValue(participation);
    categoriesRepository.find.mockResolvedValue([category]);
    playerRanksRepository.find.mockResolvedValue([existingRank]);
    definitionsRepository.find.mockResolvedValue([definitionSilver, definitionBronze]);
    playerRanksRepository.merge.mockImplementation((entity, payload) => ({ ...entity, ...payload }));
    playerRanksRepository.save.mockImplementation(async (payload) => payload);

    const result = await service.recomputeParticipationRanks(participation.id);

    expect(result.createdRanksCount).toBe(0);
    expect(result.updatedRanks).toEqual([
      { categoryCode: 'KILLS_RANK', rankDefinitionId: definitionSilver.id },
    ]);
  });

  it('recompute leaves ranks unchanged when no change is needed', async () => {
    const existingRank: PlayerRank = {
      id: 'pr-1',
      participationId: participation.id,
      participation: {} as never,
      categoryId: category.id,
      category,
      rankDefinitionId: definitionSilver.id,
      rankDefinition: definitionSilver,
      unlockedAt: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    participationsRepository.findOne.mockResolvedValue(participation);
    categoriesRepository.find.mockResolvedValue([category]);
    playerRanksRepository.find.mockResolvedValue([existingRank]);
    definitionsRepository.find.mockResolvedValue([definitionSilver, definitionBronze]);

    const result = await service.recomputeParticipationRanks(participation.id);

    expect(result.updatedRanks).toEqual([]);
    expect(result.unchangedRanksCount).toBe(1);
    expect(result.createdRanksCount).toBe(0);
  });

  it('recompute handles multiple categories correctly', async () => {
    const categories: RankCategory[] = [
      category,
      {
        id: 'cat-mass',
        code: 'MASS_BATTLE_WINS_RANK',
        name: 'Mass Wins',
        definitions: [],
        playerRanks: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 'cat-duel',
        code: 'CHALLENGE_WINS_RANK',
        name: 'Duel Wins',
        definitions: [],
        playerRanks: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    participationsRepository.findOne.mockResolvedValue(participation);
    categoriesRepository.find.mockResolvedValue(categories);
    playerRanksRepository.find.mockResolvedValue([]);
    definitionsRepository.find
      .mockResolvedValueOnce([definitionSilver, definitionBronze])
      .mockResolvedValueOnce([
        {
          ...definitionBronze,
          id: 'mass-def',
          categoryId: 'cat-mass',
          threshold: 2,
        },
      ])
      .mockResolvedValueOnce([
        {
          ...definitionBronze,
          id: 'duel-def',
          categoryId: 'cat-duel',
          threshold: 3,
        },
      ]);

    playerRanksRepository.create.mockImplementation((payload) => payload);
    playerRanksRepository.save.mockImplementation(async (payload) => payload);

    const result = await service.recomputeParticipationRanks(participation.id);

    expect(result.createdRanksCount).toBe(3);
    expect(result.updatedRanks).toEqual([
      { categoryCode: 'KILLS_RANK', rankDefinitionId: 'def-2' },
      { categoryCode: 'MASS_BATTLE_WINS_RANK', rankDefinitionId: 'mass-def' },
      { categoryCode: 'CHALLENGE_WINS_RANK', rankDefinitionId: 'duel-def' },
    ]);
  });
});
