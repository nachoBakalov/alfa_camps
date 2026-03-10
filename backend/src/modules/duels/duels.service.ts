import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Battle } from '../battles/entities/battle.entity';
import { BattleType } from '../battles/enums/battle-type.enum';
import { CampParticipation } from '../camp-participations/entities/camp-participation.entity';
import { CreateDuelDto } from './dto/create-duel.dto';
import { UpdateDuelDto } from './dto/update-duel.dto';
import { Duel } from './entities/duel.entity';

@Injectable()
export class DuelsService {
  constructor(
    @InjectRepository(Duel)
    private readonly duelsRepository: Repository<Duel>,
    @InjectRepository(Battle)
    private readonly battlesRepository: Repository<Battle>,
    @InjectRepository(CampParticipation)
    private readonly campParticipationsRepository: Repository<CampParticipation>,
  ) {}

  async create(createDuelDto: CreateDuelDto): Promise<Duel> {
    const battle = await this.findBattleOrThrow(createDuelDto.battleId);
    const playerA = await this.findParticipationOrThrow(createDuelDto.playerAParticipationId);
    const playerB = await this.findParticipationOrThrow(createDuelDto.playerBParticipationId);
    const winner = createDuelDto.winnerParticipationId
      ? await this.findParticipationOrThrow(createDuelDto.winnerParticipationId)
      : null;

    this.validateDuelParticipants({ battle, playerA, playerB, winner });

    const duel = this.duelsRepository.create({
      battleId: createDuelDto.battleId,
      playerAParticipationId: createDuelDto.playerAParticipationId,
      playerBParticipationId: createDuelDto.playerBParticipationId,
      winnerParticipationId: createDuelDto.winnerParticipationId ?? null,
    });

    return this.duelsRepository.save(duel);
  }

  async findAll(): Promise<Duel[]> {
    return this.duelsRepository.find({
      order: {
        createdAt: 'DESC',
      },
    });
  }

  async findOne(id: string): Promise<Duel> {
    const duel = await this.duelsRepository.findOne({ where: { id } });

    if (!duel) {
      throw new NotFoundException(`Duel with id ${id} was not found`);
    }

    return duel;
  }

  async update(id: string, updateDuelDto: UpdateDuelDto): Promise<Duel> {
    const duel = await this.findOne(id);

    if (updateDuelDto.winnerParticipationId) {
      const winner = await this.findParticipationOrThrow(updateDuelDto.winnerParticipationId);
      this.validateWinnerIsParticipant(duel, winner.id);
    }

    const updatedDuel = this.duelsRepository.merge(duel, {
      winnerParticipationId:
        updateDuelDto.winnerParticipationId !== undefined
          ? updateDuelDto.winnerParticipationId
          : duel.winnerParticipationId,
    });

    return this.duelsRepository.save(updatedDuel);
  }

  async remove(id: string): Promise<void> {
    const duel = await this.findOne(id);
    await this.duelsRepository.remove(duel);
  }

  async findByBattle(battleId: string): Promise<Duel[]> {
    await this.findBattleOrThrow(battleId);

    return this.duelsRepository.find({
      where: { battleId },
      order: {
        createdAt: 'ASC',
      },
    });
  }

  async findByParticipation(participationId: string): Promise<Duel[]> {
    await this.findParticipationOrThrow(participationId);

    return this.duelsRepository.find({
      where: [
        { playerAParticipationId: participationId },
        { playerBParticipationId: participationId },
      ],
      order: {
        createdAt: 'ASC',
      },
    });
  }

  private async findBattleOrThrow(battleId: string): Promise<Battle> {
    const battle = await this.battlesRepository.findOne({ where: { id: battleId } });

    if (!battle) {
      throw new NotFoundException(`Battle with id ${battleId} was not found`);
    }

    return battle;
  }

  private async findParticipationOrThrow(
    participationId: string,
  ): Promise<CampParticipation> {
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

  private validateDuelParticipants(params: {
    battle: Battle;
    playerA: CampParticipation;
    playerB: CampParticipation;
    winner: CampParticipation | null;
  }): void {
    const { battle, playerA, playerB, winner } = params;

    if (battle.battleType !== BattleType.DUEL_SESSION) {
      throw new BadRequestException('Duels are allowed only for DUEL_SESSION battles');
    }

    if (playerA.id === playerB.id) {
      throw new BadRequestException('playerAParticipationId and playerBParticipationId must be different');
    }

    if (playerA.campId !== battle.campId || playerB.campId !== battle.campId) {
      throw new BadRequestException('Both players must belong to the same camp as battle');
    }

    if (!winner) {
      return;
    }

    if (winner.id !== playerA.id && winner.id !== playerB.id) {
      throw new BadRequestException('winnerParticipationId must be either player A or player B');
    }
  }

  private validateWinnerIsParticipant(duel: Duel, winnerParticipationId: string): void {
    if (
      winnerParticipationId !== duel.playerAParticipationId &&
      winnerParticipationId !== duel.playerBParticipationId
    ) {
      throw new BadRequestException('winnerParticipationId must be either player A or player B');
    }
  }
}
