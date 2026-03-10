import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { QueryFailedError, Repository } from 'typeorm';
import { CampParticipation } from '../camp-participations/entities/camp-participation.entity';
import { AwardMedalDto } from './dto/award-medal.dto';
import { CreateMedalDefinitionDto } from './dto/create-medal-definition.dto';
import { UpdateMedalDefinitionDto } from './dto/update-medal-definition.dto';
import { MedalDefinition } from './entities/medal-definition.entity';
import { PlayerMedal } from './entities/player-medal.entity';

@Injectable()
export class MedalsService {
  constructor(
    @InjectRepository(MedalDefinition)
    private readonly medalDefinitionsRepository: Repository<MedalDefinition>,
    @InjectRepository(PlayerMedal)
    private readonly playerMedalsRepository: Repository<PlayerMedal>,
    @InjectRepository(CampParticipation)
    private readonly campParticipationsRepository: Repository<CampParticipation>,
  ) {}

  async createDefinition(createMedalDefinitionDto: CreateMedalDefinitionDto): Promise<MedalDefinition> {
    const medalDefinition = this.medalDefinitionsRepository.create({
      ...createMedalDefinitionDto,
      description: createMedalDefinitionDto.description ?? null,
      iconUrl: createMedalDefinitionDto.iconUrl ?? null,
    });

    try {
      return await this.medalDefinitionsRepository.save(medalDefinition);
    } catch (error: unknown) {
      this.handleDefinitionUniqueError(error);
      throw error;
    }
  }

  async findAllDefinitions(): Promise<MedalDefinition[]> {
    return this.medalDefinitionsRepository.find({
      order: {
        createdAt: 'DESC',
      },
    });
  }

  async findOneDefinition(id: string): Promise<MedalDefinition> {
    const definition = await this.medalDefinitionsRepository.findOne({ where: { id } });

    if (!definition) {
      throw new NotFoundException(`Medal definition with id ${id} was not found`);
    }

    return definition;
  }

  async updateDefinition(
    id: string,
    updateMedalDefinitionDto: UpdateMedalDefinitionDto,
  ): Promise<MedalDefinition> {
    const definition = await this.findOneDefinition(id);
    const updatedDefinition = this.medalDefinitionsRepository.merge(definition, {
      ...updateMedalDefinitionDto,
      description:
        updateMedalDefinitionDto.description !== undefined
          ? updateMedalDefinitionDto.description
          : definition.description,
      iconUrl:
        updateMedalDefinitionDto.iconUrl !== undefined
          ? updateMedalDefinitionDto.iconUrl
          : definition.iconUrl,
    });

    try {
      return await this.medalDefinitionsRepository.save(updatedDefinition);
    } catch (error: unknown) {
      this.handleDefinitionUniqueError(error);
      throw error;
    }
  }

  async removeDefinition(id: string): Promise<void> {
    const definition = await this.findOneDefinition(id);
    await this.medalDefinitionsRepository.remove(definition);
  }

  async findMedalsByParticipation(participationId: string): Promise<PlayerMedal[]> {
    await this.findParticipationOrThrow(participationId);

    return this.playerMedalsRepository.find({
      where: { participationId },
      order: {
        awardedAt: 'DESC',
      },
    });
  }

  async awardMedal(awardMedalDto: AwardMedalDto, awardedBy?: string | null): Promise<PlayerMedal> {
    await this.findParticipationOrThrow(awardMedalDto.participationId);
    await this.findOneDefinition(awardMedalDto.medalId);

    const existing = await this.playerMedalsRepository.findOne({
      where: {
        participationId: awardMedalDto.participationId,
        medalId: awardMedalDto.medalId,
      },
    });

    if (existing) {
      throw new ConflictException('This medal is already awarded to this participation');
    }

    const playerMedal = this.playerMedalsRepository.create({
      participationId: awardMedalDto.participationId,
      medalId: awardMedalDto.medalId,
      awardedBy: awardedBy ?? null,
      note: awardMedalDto.note ?? null,
      awardedAt: new Date(),
    });

    return this.playerMedalsRepository.save(playerMedal);
  }

  async removeAward(playerMedalId: string): Promise<void> {
    const playerMedal = await this.playerMedalsRepository.findOne({ where: { id: playerMedalId } });

    if (!playerMedal) {
      throw new NotFoundException(`Player medal with id ${playerMedalId} was not found`);
    }

    await this.playerMedalsRepository.remove(playerMedal);
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

    if (driverError.constraint?.includes('name')) {
      throw new ConflictException('Medal definition name already exists');
    }

    throw new ConflictException('Medal definition with provided unique fields already exists');
  }
}
