import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { QueryFailedError, Repository } from 'typeorm';
import { CampParticipation } from '../camp-participations/entities/camp-participation.entity';
import { CreateAchievementDefinitionDto } from './dto/create-achievement-definition.dto';
import { UnlockParticipationAchievementsResultDto } from './dto/unlock-participation-achievements-result.dto';
import { UpdateAchievementDefinitionDto } from './dto/update-achievement-definition.dto';
import { AchievementDefinition } from './entities/achievement-definition.entity';
import { PlayerAchievement } from './entities/player-achievement.entity';
import { AchievementConditionType } from './enums/achievement-condition-type.enum';

@Injectable()
export class AchievementsService {
  constructor(
    @InjectRepository(AchievementDefinition)
    private readonly definitionsRepository: Repository<AchievementDefinition>,
    @InjectRepository(PlayerAchievement)
    private readonly playerAchievementsRepository: Repository<PlayerAchievement>,
    @InjectRepository(CampParticipation)
    private readonly campParticipationsRepository: Repository<CampParticipation>,
  ) {}

  async createDefinition(
    createAchievementDefinitionDto: CreateAchievementDefinitionDto,
  ): Promise<AchievementDefinition> {
    const definition = this.definitionsRepository.create({
      ...createAchievementDefinitionDto,
      description: createAchievementDefinitionDto.description ?? null,
      iconUrl: createAchievementDefinitionDto.iconUrl ?? null,
    });

    try {
      return await this.definitionsRepository.save(definition);
    } catch (error: unknown) {
      this.handleUniqueConstraintError(error);
      throw error;
    }
  }

  async findAllDefinitions(): Promise<AchievementDefinition[]> {
    return this.definitionsRepository.find({
      order: {
        conditionType: 'ASC',
        threshold: 'ASC',
        createdAt: 'ASC',
      },
    });
  }

  async findOneDefinition(id: string): Promise<AchievementDefinition> {
    const definition = await this.definitionsRepository.findOne({ where: { id } });

    if (!definition) {
      throw new NotFoundException(`Achievement definition with id ${id} was not found`);
    }

    return definition;
  }

  async updateDefinition(
    id: string,
    updateAchievementDefinitionDto: UpdateAchievementDefinitionDto,
  ): Promise<AchievementDefinition> {
    const definition = await this.findOneDefinition(id);
    const updatedDefinition = this.definitionsRepository.merge(definition, {
      ...updateAchievementDefinitionDto,
      description:
        updateAchievementDefinitionDto.description !== undefined
          ? updateAchievementDefinitionDto.description
          : definition.description,
      iconUrl:
        updateAchievementDefinitionDto.iconUrl !== undefined
          ? updateAchievementDefinitionDto.iconUrl
          : definition.iconUrl,
    });

    try {
      return await this.definitionsRepository.save(updatedDefinition);
    } catch (error: unknown) {
      this.handleUniqueConstraintError(error);
      throw error;
    }
  }

  async removeDefinition(id: string): Promise<void> {
    const definition = await this.findOneDefinition(id);
    await this.definitionsRepository.remove(definition);
  }

  async findAchievementsByParticipation(participationId: string): Promise<PlayerAchievement[]> {
    await this.findParticipationOrThrow(participationId);

    return this.playerAchievementsRepository.find({
      where: { participationId },
      order: {
        createdAt: 'ASC',
      },
    });
  }

  async unlockParticipationAchievements(
    participationId: string,
  ): Promise<UnlockParticipationAchievementsResultDto> {
    const participation = await this.findParticipationOrThrow(participationId);

    const definitions = await this.definitionsRepository.find();
    const eligible = definitions.filter((definition) => {
      const value = this.getStatValue(participation, definition.conditionType);
      return value >= definition.threshold;
    });

    const existing = await this.playerAchievementsRepository.find({ where: { participationId } });
    const existingAchievementIds = new Set(existing.map((row) => row.achievementId));

    const unlockedAchievementIds: string[] = [];

    for (const definition of eligible) {
      if (existingAchievementIds.has(definition.id)) {
        continue;
      }

      const playerAchievement = this.playerAchievementsRepository.create({
        participationId,
        achievementId: definition.id,
        unlockedAt: new Date(),
      });

      await this.playerAchievementsRepository.save(playerAchievement);
      unlockedAchievementIds.push(definition.id);
      existingAchievementIds.add(definition.id);
    }

    return {
      participationId,
      unlockedCount: unlockedAchievementIds.length,
      totalEligibleCount: eligible.length,
      unlockedAchievementIds,
    };
  }

  private async findParticipationOrThrow(participationId: string): Promise<CampParticipation> {
    const participation = await this.campParticipationsRepository.findOne({
      where: { id: participationId },
    });

    if (!participation) {
      throw new NotFoundException(
        `Camp participation with id ${participationId} was not found`,
      );
    }

    return participation;
  }

  private getStatValue(
    participation: CampParticipation,
    conditionType: AchievementConditionType,
  ): number {
    if (conditionType === AchievementConditionType.KILLS) {
      return participation.kills;
    }

    if (conditionType === AchievementConditionType.SURVIVALS) {
      return participation.survivals;
    }

    if (conditionType === AchievementConditionType.DUEL_WINS) {
      return participation.duelWins;
    }

    return participation.points;
  }

  private handleUniqueConstraintError(error: unknown): void {
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

    throw new ConflictException('Achievement definition with the same condition, threshold and name already exists');
  }
}
