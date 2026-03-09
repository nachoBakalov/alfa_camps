import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { QueryFailedError, Repository } from 'typeorm';
import { CampType } from '../camp-types/entities/camp-type.entity';
import { CreateTeamTemplateDto } from './dto/create-team-template.dto';
import { UpdateTeamTemplateDto } from './dto/update-team-template.dto';
import { TeamTemplate } from './entities/team-template.entity';

@Injectable()
export class TeamTemplatesService {
  constructor(
    @InjectRepository(TeamTemplate)
    private readonly teamTemplatesRepository: Repository<TeamTemplate>,
    @InjectRepository(CampType)
    private readonly campTypesRepository: Repository<CampType>,
  ) {}

  async create(createTeamTemplateDto: CreateTeamTemplateDto): Promise<TeamTemplate> {
    await this.ensureCampTypeExists(createTeamTemplateDto.campTypeId);

    const teamTemplate = this.teamTemplatesRepository.create(createTeamTemplateDto);

    try {
      return await this.teamTemplatesRepository.save(teamTemplate);
    } catch (error: unknown) {
      this.handleUniqueConstraintError(error);
      throw error;
    }
  }

  async findAll(): Promise<TeamTemplate[]> {
    return this.teamTemplatesRepository.find({
      order: {
        createdAt: 'DESC',
      },
    });
  }

  async findOne(id: string): Promise<TeamTemplate> {
    const teamTemplate = await this.teamTemplatesRepository.findOne({ where: { id } });

    if (!teamTemplate) {
      throw new NotFoundException(`Team template with id ${id} was not found`);
    }

    return teamTemplate;
  }

  async findByCampType(campTypeId: string): Promise<TeamTemplate[]> {
    await this.ensureCampTypeExists(campTypeId);

    return this.teamTemplatesRepository.find({
      where: { campTypeId },
      order: {
        sortOrder: 'ASC',
        createdAt: 'ASC',
      },
    });
  }

  async update(
    id: string,
    updateTeamTemplateDto: UpdateTeamTemplateDto,
  ): Promise<TeamTemplate> {
    const teamTemplate = await this.findOne(id);

    if (updateTeamTemplateDto.campTypeId) {
      await this.ensureCampTypeExists(updateTeamTemplateDto.campTypeId);
    }

    const updatedTeamTemplate = this.teamTemplatesRepository.merge(
      teamTemplate,
      updateTeamTemplateDto,
    );

    try {
      return await this.teamTemplatesRepository.save(updatedTeamTemplate);
    } catch (error: unknown) {
      this.handleUniqueConstraintError(error);
      throw error;
    }
  }

  async remove(id: string): Promise<void> {
    const teamTemplate = await this.findOne(id);
    await this.teamTemplatesRepository.remove(teamTemplate);
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

    if (driverError.constraint?.includes('camp_type_name')) {
      throw new ConflictException('Team template name already exists for this camp type');
    }

    throw new ConflictException('Team template with provided unique fields already exists');
  }
}
