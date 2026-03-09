import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { QueryFailedError, Repository } from 'typeorm';
import { Camp } from '../camps/entities/camp.entity';
import { TeamTemplate } from '../team-templates/entities/team-template.entity';
import { CampTeam } from './entities/camp-team.entity';
import { CreateCampTeamDto } from './dto/create-camp-team.dto';
import { UpdateCampTeamDto } from './dto/update-camp-team.dto';

@Injectable()
export class CampTeamsService {
  constructor(
    @InjectRepository(CampTeam)
    private readonly campTeamsRepository: Repository<CampTeam>,
    @InjectRepository(Camp)
    private readonly campsRepository: Repository<Camp>,
    @InjectRepository(TeamTemplate)
    private readonly teamTemplatesRepository: Repository<TeamTemplate>,
  ) {}

  async create(createCampTeamDto: CreateCampTeamDto): Promise<CampTeam> {
    await this.ensureCampExists(createCampTeamDto.campId);

    const campTeam = this.campTeamsRepository.create(createCampTeamDto);

    try {
      return await this.campTeamsRepository.save(campTeam);
    } catch (error: unknown) {
      this.handleUniqueConstraintError(error);
      throw error;
    }
  }

  async findAll(): Promise<CampTeam[]> {
    return this.campTeamsRepository.find({
      order: {
        createdAt: 'DESC',
      },
    });
  }

  async findOne(id: string): Promise<CampTeam> {
    const campTeam = await this.campTeamsRepository.findOne({ where: { id } });

    if (!campTeam) {
      throw new NotFoundException(`Camp team with id ${id} was not found`);
    }

    return campTeam;
  }

  async findByCamp(campId: string): Promise<CampTeam[]> {
    await this.ensureCampExists(campId);

    return this.campTeamsRepository.find({
      where: { campId },
      order: {
        createdAt: 'ASC',
      },
    });
  }

  async update(id: string, updateCampTeamDto: UpdateCampTeamDto): Promise<CampTeam> {
    const campTeam = await this.findOne(id);
    const updatedCampTeam = this.campTeamsRepository.merge(campTeam, updateCampTeamDto);

    try {
      return await this.campTeamsRepository.save(updatedCampTeam);
    } catch (error: unknown) {
      this.handleUniqueConstraintError(error);
      throw error;
    }
  }

  async remove(id: string): Promise<void> {
    const campTeam = await this.findOne(id);
    await this.campTeamsRepository.remove(campTeam);
  }

  async cloneFromCampTypeTemplates(campId: string): Promise<CampTeam[]> {
    const camp = await this.campsRepository.findOne({ where: { id: campId } });

    if (!camp) {
      throw new NotFoundException(`Camp with id ${campId} was not found`);
    }

    const templates = await this.teamTemplatesRepository.find({
      where: { campTypeId: camp.campTypeId },
      order: { sortOrder: 'ASC', createdAt: 'ASC' },
    });

    const existingTeams = await this.campTeamsRepository.find({
      where: { campId },
    });

    const existingNames = new Set(existingTeams.map((team) => team.name));

    const teamsToCreate = templates
      .filter((template) => !existingNames.has(template.name))
      .map((template) =>
        this.campTeamsRepository.create({
          campId,
          name: template.name,
          color: template.color,
          logoUrl: template.logoUrl,
        }),
      );

    if (teamsToCreate.length > 0) {
      await this.campTeamsRepository.save(teamsToCreate);
    }

    return this.findByCamp(campId);
  }

  private async ensureCampExists(campId: string): Promise<void> {
    const camp = await this.campsRepository.findOne({ where: { id: campId } });

    if (!camp) {
      throw new NotFoundException(`Camp with id ${campId} was not found`);
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

    if (driverError.constraint?.includes('camp_name')) {
      throw new ConflictException('Camp team name already exists in this camp');
    }

    throw new ConflictException('Camp team with provided unique fields already exists');
  }
}
