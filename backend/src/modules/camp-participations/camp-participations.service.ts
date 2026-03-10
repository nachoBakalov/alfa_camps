import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { QueryFailedError, Repository } from 'typeorm';
import { Camp } from '../camps/entities/camp.entity';
import { Player } from '../players/entities/player.entity';
import { CreateCampParticipationDto } from './dto/create-camp-participation.dto';
import { UpdateCampParticipationDto } from './dto/update-camp-participation.dto';
import { CampParticipation } from './entities/camp-participation.entity';

@Injectable()
export class CampParticipationsService {
  constructor(
    @InjectRepository(CampParticipation)
    private readonly campParticipationsRepository: Repository<CampParticipation>,
    @InjectRepository(Camp)
    private readonly campsRepository: Repository<Camp>,
    @InjectRepository(Player)
    private readonly playersRepository: Repository<Player>,
  ) {}

  async create(
    createCampParticipationDto: CreateCampParticipationDto,
  ): Promise<CampParticipation> {
    await this.ensureCampExists(createCampParticipationDto.campId);
    await this.ensurePlayerExists(createCampParticipationDto.playerId);

    const campParticipation = this.campParticipationsRepository.create({
      ...createCampParticipationDto,
      kills: 0,
      knifeKills: 0,
      survivals: 0,
      duelWins: 0,
      massBattleWins: 0,
      points: 0,
    });

    try {
      return await this.campParticipationsRepository.save(campParticipation);
    } catch (error: unknown) {
      this.handleUniqueConstraintError(error);
      throw error;
    }
  }

  async findAll(): Promise<CampParticipation[]> {
    return this.campParticipationsRepository.find({
      order: {
        createdAt: 'DESC',
      },
    });
  }

  async findOne(id: string): Promise<CampParticipation> {
    const participation = await this.campParticipationsRepository.findOne({
      where: { id },
    });

    if (!participation) {
      throw new NotFoundException(`Camp participation with id ${id} was not found`);
    }

    return participation;
  }

  async update(
    id: string,
    updateCampParticipationDto: UpdateCampParticipationDto,
  ): Promise<CampParticipation> {
    const participation = await this.findOne(id);
    const updatedParticipation = this.campParticipationsRepository.merge(
      participation,
      updateCampParticipationDto,
    );

    return this.campParticipationsRepository.save(updatedParticipation);
  }

  async remove(id: string): Promise<void> {
    const participation = await this.findOne(id);
    await this.campParticipationsRepository.remove(participation);
  }

  async findByCamp(campId: string): Promise<CampParticipation[]> {
    await this.ensureCampExists(campId);

    return this.campParticipationsRepository.find({
      where: { campId },
      order: {
        createdAt: 'ASC',
      },
    });
  }

  async findByPlayer(playerId: string): Promise<CampParticipation[]> {
    await this.ensurePlayerExists(playerId);

    return this.campParticipationsRepository.find({
      where: { playerId },
      order: {
        createdAt: 'ASC',
      },
    });
  }

  private async ensureCampExists(campId: string): Promise<void> {
    const camp = await this.campsRepository.findOne({ where: { id: campId } });

    if (!camp) {
      throw new NotFoundException(`Camp with id ${campId} was not found`);
    }
  }

  private async ensurePlayerExists(playerId: string): Promise<void> {
    const player = await this.playersRepository.findOne({ where: { id: playerId } });

    if (!player) {
      throw new NotFoundException(`Player with id ${playerId} was not found`);
    }
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

    if (driverError.constraint?.includes('camp_player')) {
      throw new ConflictException('Participation already exists for this camp and player');
    }

    throw new ConflictException('Camp participation with provided unique fields already exists');
  }
}
