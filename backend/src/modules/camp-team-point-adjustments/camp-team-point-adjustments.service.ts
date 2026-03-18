import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CampTeam } from '../camp-teams/entities/camp-team.entity';
import { CreateCampTeamPointAdjustmentDto } from './dto/create-camp-team-point-adjustment.dto';
import { CampTeamPointAdjustment } from './entities/camp-team-point-adjustment.entity';

@Injectable()
export class CampTeamPointAdjustmentsService {
  constructor(
    @InjectRepository(CampTeamPointAdjustment)
    private readonly adjustmentsRepository: Repository<CampTeamPointAdjustment>,
    @InjectRepository(CampTeam)
    private readonly campTeamsRepository: Repository<CampTeam>,
  ) {}

  async create(
    createDto: CreateCampTeamPointAdjustmentDto,
    createdBy: string | null,
  ): Promise<CampTeamPointAdjustment> {
    const reason = createDto.reason?.trim();

    return this.adjustmentsRepository.manager.transaction(async (manager) => {
      const team = await manager.findOne(CampTeam, { where: { id: createDto.campTeamId } });

      if (!team) {
        throw new NotFoundException(`Camp team with id ${createDto.campTeamId} was not found`);
      }

      const adjustmentRepository = manager.getRepository(CampTeamPointAdjustment);
      const adjustment = adjustmentRepository.create({
        campTeamId: createDto.campTeamId,
        delta: createDto.delta,
        reason: reason && reason.length > 0 ? reason : null,
        createdBy,
      });

      const savedAdjustment = await adjustmentRepository.save(adjustment);

      await manager.increment(CampTeam, { id: createDto.campTeamId }, 'teamPoints', createDto.delta);

      return savedAdjustment;
    });
  }

  async findByTeam(teamId: string): Promise<CampTeamPointAdjustment[]> {
    await this.ensureTeamExists(teamId);

    return this.adjustmentsRepository.find({
      where: { campTeamId: teamId },
      order: { createdAt: 'DESC' },
    });
  }

  private async ensureTeamExists(teamId: string): Promise<void> {
    const team = await this.campTeamsRepository.findOne({ where: { id: teamId } });

    if (!team) {
      throw new NotFoundException(`Camp team with id ${teamId} was not found`);
    }
  }
}
