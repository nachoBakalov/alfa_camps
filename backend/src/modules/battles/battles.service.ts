import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CampTeam } from '../camp-teams/entities/camp-team.entity';
import { Camp } from '../camps/entities/camp.entity';
import { CreateBattleDto } from './dto/create-battle.dto';
import { UpdateBattleDto } from './dto/update-battle.dto';
import { Battle } from './entities/battle.entity';
import { BattleStatus } from './enums/battle-status.enum';

@Injectable()
export class BattlesService {
  constructor(
    @InjectRepository(Battle)
    private readonly battlesRepository: Repository<Battle>,
    @InjectRepository(Camp)
    private readonly campsRepository: Repository<Camp>,
    @InjectRepository(CampTeam)
    private readonly campTeamsRepository: Repository<CampTeam>,
  ) {}

  async create(createBattleDto: CreateBattleDto, createdBy: string | null): Promise<Battle> {
    await this.ensureCampExists(createBattleDto.campId);

    if (createBattleDto.winningTeamId) {
      await this.ensureWinningTeamInCamp(createBattleDto.winningTeamId, createBattleDto.campId);
    }

    const battle = this.battlesRepository.create({
      ...createBattleDto,
      status: BattleStatus.DRAFT,
      completedAt: null,
      createdBy,
      session: createBattleDto.session ?? null,
      notes: createBattleDto.notes ?? null,
      winningTeamId: createBattleDto.winningTeamId ?? null,
    });

    return this.battlesRepository.save(battle);
  }

  async findAll(): Promise<Battle[]> {
    return this.battlesRepository.find({
      order: {
        battleDate: 'DESC',
        createdAt: 'DESC',
      },
    });
  }

  async findOne(id: string): Promise<Battle> {
    const battle = await this.battlesRepository.findOne({ where: { id } });

    if (!battle) {
      throw new NotFoundException(`Battle with id ${id} was not found`);
    }

    return battle;
  }

  async update(id: string, updateBattleDto: UpdateBattleDto): Promise<Battle> {
    const battle = await this.findOne(id);

    if (updateBattleDto.winningTeamId) {
      await this.ensureWinningTeamInCamp(updateBattleDto.winningTeamId, battle.campId);
    }

    const status = updateBattleDto.status ?? battle.status;
    const completedAt = this.resolveCompletedAt(status, battle.completedAt);

    const updatedBattle = this.battlesRepository.merge(battle, {
      ...updateBattleDto,
      session: updateBattleDto.session ?? battle.session,
      notes: updateBattleDto.notes !== undefined ? updateBattleDto.notes : battle.notes,
      winningTeamId:
        updateBattleDto.winningTeamId !== undefined
          ? updateBattleDto.winningTeamId
          : battle.winningTeamId,
      completedAt,
    });

    return this.battlesRepository.save(updatedBattle);
  }

  async remove(id: string): Promise<void> {
    const battle = await this.findOne(id);
    await this.battlesRepository.remove(battle);
  }

  async findByCamp(campId: string): Promise<Battle[]> {
    await this.ensureCampExists(campId);

    return this.battlesRepository.find({
      where: { campId },
      order: {
        battleDate: 'DESC',
        createdAt: 'DESC',
      },
    });
  }

  private async ensureCampExists(campId: string): Promise<void> {
    const camp = await this.campsRepository.findOne({ where: { id: campId } });

    if (!camp) {
      throw new NotFoundException(`Camp with id ${campId} was not found`);
    }
  }

  private async ensureWinningTeamInCamp(winningTeamId: string, campId: string): Promise<void> {
    const team = await this.campTeamsRepository.findOne({ where: { id: winningTeamId } });

    if (!team) {
      throw new NotFoundException(`Camp team with id ${winningTeamId} was not found`);
    }

    if (team.campId !== campId) {
      throw new BadRequestException('Winning team must belong to the same camp');
    }
  }

  private resolveCompletedAt(status: BattleStatus, currentCompletedAt: Date | null): Date | null {
    if (status === BattleStatus.COMPLETED) {
      return new Date();
    }

    if (status === BattleStatus.DRAFT || status === BattleStatus.CANCELLED) {
      return null;
    }

    return currentCompletedAt;
  }
}
