import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { QueryFailedError, Repository } from 'typeorm';
import { CampType } from '../camp-types/entities/camp-type.entity';
import { CreateCampDto } from './dto/create-camp.dto';
import { UpdateCampDto } from './dto/update-camp.dto';
import { Camp } from './entities/camp.entity';
import { CampStatus } from './enums/camp-status.enum';

@Injectable()
export class CampsService {
  constructor(
    @InjectRepository(Camp)
    private readonly campsRepository: Repository<Camp>,
    @InjectRepository(CampType)
    private readonly campTypesRepository: Repository<CampType>,
  ) {}

  async create(createCampDto: CreateCampDto, createdBy: string | null): Promise<Camp> {
    await this.ensureCampTypeExists(createCampDto.campTypeId);

    const camp = this.campsRepository.create({
      ...createCampDto,
      status: CampStatus.DRAFT,
      createdBy,
    });

    try {
      return await this.campsRepository.save(camp);
    } catch (error: unknown) {
      this.handleUniqueConstraintError(error);
      throw error;
    }
  }

  async findAll(): Promise<Camp[]> {
    return this.campsRepository.find({
      order: {
        createdAt: 'DESC',
      },
    });
  }

  async findOne(id: string): Promise<Camp> {
    const camp = await this.campsRepository.findOne({ where: { id } });

    if (!camp) {
      throw new NotFoundException(`Camp with id ${id} was not found`);
    }

    return camp;
  }

  async update(id: string, updateCampDto: UpdateCampDto): Promise<Camp> {
    const camp = await this.findOne(id);

    if (updateCampDto.campTypeId) {
      await this.ensureCampTypeExists(updateCampDto.campTypeId);
    }

    const updatedCamp = this.campsRepository.merge(camp, updateCampDto);

    try {
      return await this.campsRepository.save(updatedCamp);
    } catch (error: unknown) {
      this.handleUniqueConstraintError(error);
      throw error;
    }
  }

  async remove(id: string): Promise<void> {
    const camp = await this.findOne(id);
    await this.campsRepository.remove(camp);
  }

  private async ensureCampTypeExists(campTypeId: string): Promise<void> {
    const campType = await this.campTypesRepository.findOne({ where: { id: campTypeId } });

    if (!campType) {
      throw new NotFoundException(`Camp type with id ${campTypeId} was not found`);
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

    if (driverError.constraint?.includes('camp_type_year_title')) {
      throw new ConflictException('Camp with this camp type, year and title already exists');
    }

    throw new ConflictException('Camp with provided unique fields already exists');
  }
}
