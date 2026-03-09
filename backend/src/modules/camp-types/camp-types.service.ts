import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { QueryFailedError, Repository } from 'typeorm';
import { CreateCampTypeDto } from './dto/create-camp-type.dto';
import { UpdateCampTypeDto } from './dto/update-camp-type.dto';
import { CampType } from './entities/camp-type.entity';

@Injectable()
export class CampTypesService {
  constructor(
    @InjectRepository(CampType)
    private readonly campTypesRepository: Repository<CampType>,
  ) {}

  async create(createCampTypeDto: CreateCampTypeDto): Promise<CampType> {
    const campType = this.campTypesRepository.create(createCampTypeDto);

    try {
      return await this.campTypesRepository.save(campType);
    } catch (error: unknown) {
      this.handleUniqueConstraintError(error);
      throw error;
    }
  }

  async findAll(): Promise<CampType[]> {
    return this.campTypesRepository.find({
      order: {
        createdAt: 'DESC',
      },
    });
  }

  async findOne(id: string): Promise<CampType> {
    const campType = await this.campTypesRepository.findOne({ where: { id } });

    if (!campType) {
      throw new NotFoundException(`Camp type with id ${id} was not found`);
    }

    return campType;
  }

  async update(id: string, updateCampTypeDto: UpdateCampTypeDto): Promise<CampType> {
    const campType = await this.findOne(id);
    const updatedCampType = this.campTypesRepository.merge(campType, updateCampTypeDto);

    try {
      return await this.campTypesRepository.save(updatedCampType);
    } catch (error: unknown) {
      this.handleUniqueConstraintError(error);
      throw error;
    }
  }

  async remove(id: string): Promise<void> {
    const campType = await this.findOne(id);
    await this.campTypesRepository.remove(campType);
  }

  private handleUniqueConstraintError(error: unknown): void {
    if (!(error instanceof QueryFailedError)) {
      return;
    }

    const driverError = error.driverError as {
      code?: string;
      constraint?: string;
      detail?: string;
    };

    if (driverError.code !== '23505') {
      return;
    }

    if (driverError.constraint?.includes('name')) {
      throw new ConflictException('Camp type name already exists');
    }

    if (driverError.constraint?.includes('slug')) {
      throw new ConflictException('Camp type slug already exists');
    }

    throw new ConflictException('Camp type with provided unique fields already exists');
  }
}
