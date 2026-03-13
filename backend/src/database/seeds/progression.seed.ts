import { DataSource } from 'typeorm';
import { AchievementDefinition } from '../../modules/achievements/entities/achievement-definition.entity';
import { AchievementConditionType } from '../../modules/achievements/enums/achievement-condition-type.enum';
import { MedalDefinition } from '../../modules/medals/entities/medal-definition.entity';
import { MedalType } from '../../modules/medals/enums/medal-type.enum';
import { RankCategory } from '../../modules/ranks/entities/rank-category.entity';
import { RankDefinition } from '../../modules/ranks/entities/rank-definition.entity';

type SeedSummary = {
  createdRankCategories: number;
  skippedRankCategories: number;
  createdRankDefinitions: number;
  skippedRankDefinitions: number;
  createdAchievementDefinitions: number;
  skippedAchievementDefinitions: number;
  createdMedalDefinitions: number;
  skippedMedalDefinitions: number;
};

const rankCategorySeeds = [
  { code: 'KILLS_RANK', name: 'Kills Rank', iconBasePath: '/ranks/kills' },
  {
    code: 'MASS_BATTLE_WINS_RANK',
    name: 'Mass Battle Wins Rank',
    iconBasePath: '/ranks/mass-battle-wins',
  },
  {
    code: 'CHALLENGE_WINS_RANK',
    name: 'Challenge Wins Rank',
    iconBasePath: '/ranks/challenge-wins',
  },
  {
    code: 'SURVIVALS_RANK',
    name: 'Survivals Rank',
    iconBasePath: '/assets/ranks/survive',
  },
] as const;

const rankThresholdsByCategoryCode: Record<string, number[]> = {
  KILLS_RANK: [1, 5, 10, 15, 20, 25, 30, 35, 40],
  MASS_BATTLE_WINS_RANK: [1, 2, 3, 4, 5, 6, 7, 8, 9],
  CHALLENGE_WINS_RANK: [1, 2, 3, 4, 5, 6, 7, 8, 9],
  SURVIVALS_RANK: [1, 2, 3, 4, 5, 6, 7, 8, 9],
};

const achievementThresholdsByType: Array<{
  type: AchievementConditionType;
  label: string;
  iconPrefix: string;
  thresholds: number[];
}> = [
  {
    type: AchievementConditionType.KILLS,
    label: 'Kills',
    iconPrefix: 'kills',
    thresholds: [1, 5, 10, 15, 20, 25, 30, 35, 40],
  },
  {
    type: AchievementConditionType.SURVIVALS,
    label: 'Survivals',
    iconPrefix: 'survivals',
    thresholds: [1, 3, 5, 8, 9],
  },
  {
    type: AchievementConditionType.DUEL_WINS,
    label: 'Duel Wins',
    iconPrefix: 'duel-wins',
    thresholds: [1, 3, 5, 7, 9],
  },
  {
    type: AchievementConditionType.POINTS,
    label: 'Points',
    iconPrefix: 'points',
    thresholds: [10, 20, 30, 40, 50],
  },
];

const medalSeeds: Array<{
  name: string;
  description: string;
  iconUrl: string;
  type: MedalType;
}> = [
  {
    name: 'Лъвско сърце',
    description: 'Спечели три масови битки',
    iconUrl: '/medals/lavsko-sarce.png',
    type: MedalType.MANUAL,
  },
  {
    name: 'Железен кръст',
    description: 'Над 40 убийства',
    iconUrl: '/medals/jelezen-krast.png',
    type: MedalType.MANUAL,
  },
  {
    name: 'Безсмъртен войн',
    description: 'Оцелял в повече от 8 битки',
    iconUrl: '/medals/bezsmarten-voin.png',
    type: MedalType.MANUAL,
  },
  {
    name: 'Командо',
    description: 'Спечелил 7 индивидуални битки',
    iconUrl: '/medals/komando.png',
    type: MedalType.MANUAL,
  },
  {
    name: 'Ура',
    description: 'Над 10 убийства с нож',
    iconUrl: '/medals/ura.png',
    type: MedalType.MANUAL,
  },
];

export async function seedProgression(dataSource: DataSource): Promise<SeedSummary> {
  const rankCategoriesRepository = dataSource.getRepository(RankCategory);
  const rankDefinitionsRepository = dataSource.getRepository(RankDefinition);
  const achievementDefinitionsRepository = dataSource.getRepository(AchievementDefinition);
  const medalDefinitionsRepository = dataSource.getRepository(MedalDefinition);

  const summary: SeedSummary = {
    createdRankCategories: 0,
    skippedRankCategories: 0,
    createdRankDefinitions: 0,
    skippedRankDefinitions: 0,
    createdAchievementDefinitions: 0,
    skippedAchievementDefinitions: 0,
    createdMedalDefinitions: 0,
    skippedMedalDefinitions: 0,
  };

  const categoryByCode = new Map<string, RankCategory>();

  for (const categorySeed of rankCategorySeeds) {
    const existingCategory = await rankCategoriesRepository.findOne({
      where: { code: categorySeed.code },
    });

    if (existingCategory) {
      categoryByCode.set(categorySeed.code, existingCategory);
      summary.skippedRankCategories += 1;
      continue;
    }

    const category = rankCategoriesRepository.create({
      code: categorySeed.code,
      name: categorySeed.name,
    });

    const savedCategory = await rankCategoriesRepository.save(category);
    categoryByCode.set(categorySeed.code, savedCategory);
    summary.createdRankCategories += 1;
  }

  for (const categorySeed of rankCategorySeeds) {
    const category = categoryByCode.get(categorySeed.code);

    if (!category) {
      continue;
    }

    const thresholds = rankThresholdsByCategoryCode[categorySeed.code] ?? [];

    for (let index = 0; index < thresholds.length; index += 1) {
      const threshold = thresholds[index];
      const rankOrder = index + 1;

      const existingDefinition = await rankDefinitionsRepository.findOne({
        where: {
          categoryId: category.id,
          threshold,
        },
      });

      if (existingDefinition) {
        summary.skippedRankDefinitions += 1;
        continue;
      }

      const definition = rankDefinitionsRepository.create({
        categoryId: category.id,
        threshold,
        rankOrder,
        name: `${categorySeed.name} ${threshold}`,
        iconUrl:
          categorySeed.code === 'SURVIVALS_RANK'
            ? `${categorySeed.iconBasePath}/${threshold}_survive.png`
            : `${categorySeed.iconBasePath}/${threshold}.png`,
      });

      await rankDefinitionsRepository.save(definition);
      summary.createdRankDefinitions += 1;
    }
  }

  for (const achievementSeed of achievementThresholdsByType) {
    for (const threshold of achievementSeed.thresholds) {
      const name = `${achievementSeed.label} ${threshold}`;

      const existingAchievement = await achievementDefinitionsRepository.findOne({
        where: {
          conditionType: achievementSeed.type,
          threshold,
          name,
        },
      });

      if (existingAchievement) {
        summary.skippedAchievementDefinitions += 1;
        continue;
      }

      const achievement = achievementDefinitionsRepository.create({
        name,
        conditionType: achievementSeed.type,
        threshold,
        description: `Reach ${achievementSeed.label.toLowerCase()} ${threshold}`,
        iconUrl: `/achievements/${achievementSeed.iconPrefix}/${threshold}.png`,
      });

      await achievementDefinitionsRepository.save(achievement);
      summary.createdAchievementDefinitions += 1;
    }
  }

  for (const medalSeed of medalSeeds) {
    const existingMedal = await medalDefinitionsRepository.findOne({
      where: { name: medalSeed.name },
    });

    if (existingMedal) {
      summary.skippedMedalDefinitions += 1;
      continue;
    }

    const medal = medalDefinitionsRepository.create({
      ...medalSeed,
    });

    await medalDefinitionsRepository.save(medal);
    summary.createdMedalDefinitions += 1;
  }

  return summary;
}
