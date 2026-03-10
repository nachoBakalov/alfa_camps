import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { QueryFailedError, Repository } from 'typeorm';
import { CampParticipation } from '../camp-participations/entities/camp-participation.entity';
import { CreateRankCategoryDto } from './dto/create-rank-category.dto';
import { CreateRankDefinitionDto } from './dto/create-rank-definition.dto';
import { RecomputeParticipationRanksResultDto } from './dto/recompute-participation-ranks-result.dto';
import { UpdateRankCategoryDto } from './dto/update-rank-category.dto';
import { UpdateRankDefinitionDto } from './dto/update-rank-definition.dto';
import { PlayerRank } from './entities/player-rank.entity';
import { RankCategory } from './entities/rank-category.entity';
import { RankDefinition } from './entities/rank-definition.entity';

@Injectable()
export class RanksService {
  constructor(
    @InjectRepository(RankCategory)
    private readonly rankCategoriesRepository: Repository<RankCategory>,
    @InjectRepository(RankDefinition)
    private readonly rankDefinitionsRepository: Repository<RankDefinition>,
    @InjectRepository(PlayerRank)
    private readonly playerRanksRepository: Repository<PlayerRank>,
    @InjectRepository(CampParticipation)
    private readonly campParticipationsRepository: Repository<CampParticipation>,
  ) {}

  async createCategory(createRankCategoryDto: CreateRankCategoryDto): Promise<RankCategory> {
    const category = this.rankCategoriesRepository.create(createRankCategoryDto);

    try {
      return await this.rankCategoriesRepository.save(category);
    } catch (error: unknown) {
      this.handleCategoryUniqueError(error);
      throw error;
    }
  }

  async findAllCategories(): Promise<RankCategory[]> {
    return this.rankCategoriesRepository.find({
      order: {
        createdAt: 'DESC',
      },
    });
  }

  async findOneCategory(id: string): Promise<RankCategory> {
    const category = await this.rankCategoriesRepository.findOne({ where: { id } });

    if (!category) {
      throw new NotFoundException(`Rank category with id ${id} was not found`);
    }

    return category;
  }

  async updateCategory(id: string, updateRankCategoryDto: UpdateRankCategoryDto): Promise<RankCategory> {
    const category = await this.findOneCategory(id);
    const updatedCategory = this.rankCategoriesRepository.merge(category, updateRankCategoryDto);

    try {
      return await this.rankCategoriesRepository.save(updatedCategory);
    } catch (error: unknown) {
      this.handleCategoryUniqueError(error);
      throw error;
    }
  }

  async removeCategory(id: string): Promise<void> {
    const category = await this.findOneCategory(id);
    await this.rankCategoriesRepository.remove(category);
  }

  async createDefinition(createRankDefinitionDto: CreateRankDefinitionDto): Promise<RankDefinition> {
    await this.findOneCategory(createRankDefinitionDto.categoryId);

    const definition = this.rankDefinitionsRepository.create({
      ...createRankDefinitionDto,
      name: createRankDefinitionDto.name ?? null,
      iconUrl: createRankDefinitionDto.iconUrl ?? null,
    });

    try {
      return await this.rankDefinitionsRepository.save(definition);
    } catch (error: unknown) {
      this.handleDefinitionUniqueError(error);
      throw error;
    }
  }

  async findAllDefinitions(): Promise<RankDefinition[]> {
    return this.rankDefinitionsRepository.find({
      order: {
        categoryId: 'ASC',
        rankOrder: 'ASC',
      },
    });
  }

  async findDefinitionsByCategory(categoryId: string): Promise<RankDefinition[]> {
    await this.findOneCategory(categoryId);

    return this.rankDefinitionsRepository.find({
      where: { categoryId },
      order: {
        rankOrder: 'ASC',
        threshold: 'ASC',
      },
    });
  }

  async findOneDefinition(id: string): Promise<RankDefinition> {
    const definition = await this.rankDefinitionsRepository.findOne({ where: { id } });

    if (!definition) {
      throw new NotFoundException(`Rank definition with id ${id} was not found`);
    }

    return definition;
  }

  async updateDefinition(
    id: string,
    updateRankDefinitionDto: UpdateRankDefinitionDto,
  ): Promise<RankDefinition> {
    const definition = await this.findOneDefinition(id);

    const updatedDefinition = this.rankDefinitionsRepository.merge(definition, {
      ...updateRankDefinitionDto,
      name:
        updateRankDefinitionDto.name !== undefined
          ? updateRankDefinitionDto.name
          : definition.name,
      iconUrl:
        updateRankDefinitionDto.iconUrl !== undefined
          ? updateRankDefinitionDto.iconUrl
          : definition.iconUrl,
    });

    try {
      return await this.rankDefinitionsRepository.save(updatedDefinition);
    } catch (error: unknown) {
      this.handleDefinitionUniqueError(error);
      throw error;
    }
  }

  async removeDefinition(id: string): Promise<void> {
    const definition = await this.findOneDefinition(id);
    await this.rankDefinitionsRepository.remove(definition);
  }

  async recomputeParticipationRanks(
    participationId: string,
  ): Promise<RecomputeParticipationRanksResultDto> {
    const participation = await this.campParticipationsRepository.findOne({
      where: { id: participationId },
    });

    if (!participation) {
      throw new NotFoundException(
        `Camp participation with id ${participationId} was not found`,
      );
    }

    const categories = await this.rankCategoriesRepository.find();
    const existingRanks = await this.playerRanksRepository.find({
      where: { participationId },
    });

    const existingRankByCategoryId = new Map(
      existingRanks.map((playerRank) => [playerRank.categoryId, playerRank]),
    );

    const updatedRanks: Array<{ categoryCode: string; rankDefinitionId: string }> = [];
    let unchangedRanksCount = 0;
    let createdRanksCount = 0;

    for (const category of categories) {
      const statValue = this.getStatValueForCategory(participation, category.code);

      if (statValue === null) {
        continue;
      }

      const definitions = await this.rankDefinitionsRepository.find({
        where: { categoryId: category.id },
        order: {
          threshold: 'DESC',
          rankOrder: 'DESC',
        },
      });

      const matchedDefinition = definitions.find((definition) => definition.threshold <= statValue);

      if (!matchedDefinition) {
        if (existingRankByCategoryId.has(category.id)) {
          unchangedRanksCount += 1;
        }
        continue;
      }

      const existingRank = existingRankByCategoryId.get(category.id);

      if (!existingRank) {
        const createdRank = this.playerRanksRepository.create({
          participationId,
          categoryId: category.id,
          rankDefinitionId: matchedDefinition.id,
          unlockedAt: new Date(),
        });

        await this.playerRanksRepository.save(createdRank);
        createdRanksCount += 1;
        updatedRanks.push({ categoryCode: category.code, rankDefinitionId: matchedDefinition.id });
        continue;
      }

      if (existingRank.rankDefinitionId === matchedDefinition.id) {
        unchangedRanksCount += 1;
        continue;
      }

      const updatedRank = this.playerRanksRepository.merge(existingRank, {
        rankDefinitionId: matchedDefinition.id,
      });
      await this.playerRanksRepository.save(updatedRank);
      updatedRanks.push({ categoryCode: category.code, rankDefinitionId: matchedDefinition.id });
    }

    return {
      participationId,
      updatedRanks,
      unchangedRanksCount,
      createdRanksCount,
    };
  }

  private getStatValueForCategory(
    participation: CampParticipation,
    categoryCode: string,
  ): number | null {
    if (categoryCode === 'KILLS_RANK') {
      return participation.kills;
    }

    if (categoryCode === 'MASS_BATTLE_WINS_RANK') {
      return participation.massBattleWins;
    }

    if (categoryCode === 'CHALLENGE_WINS_RANK') {
      return participation.duelWins;
    }

    return null;
  }

  private handleCategoryUniqueError(error: unknown): void {
    if (!(error instanceof QueryFailedError)) {
      return;
    }

    const driverError = error.driverError as {
      code?: string;
      constraint?: string;
    };

    if (driverError.code !== '23505') {
      return;
    }

    if (driverError.constraint?.includes('code')) {
      throw new ConflictException('Rank category code already exists');
    }

    throw new ConflictException('Rank category with provided unique fields already exists');
  }

  private handleDefinitionUniqueError(error: unknown): void {
    if (!(error instanceof QueryFailedError)) {
      return;
    }

    const driverError = error.driverError as {
      code?: string;
      constraint?: string;
    };

    if (driverError.code !== '23505') {
      return;
    }

    if (driverError.constraint?.includes('threshold')) {
      throw new ConflictException('Rank definition threshold already exists in this category');
    }

    if (driverError.constraint?.includes('rank_order')) {
      throw new ConflictException('Rank definition rankOrder already exists in this category');
    }

    throw new ConflictException('Rank definition with provided unique fields already exists');
  }
}
