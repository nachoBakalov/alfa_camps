import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ILike, Repository } from 'typeorm';
import { CreatePlayerDto } from './dto/create-player.dto';
import { QueryPlayersDto } from './dto/query-players.dto';
import { UpdatePlayerDto } from './dto/update-player.dto';
import { Player } from './entities/player.entity';

@Injectable()
export class PlayersService {
  constructor(
    @InjectRepository(Player)
    private readonly playersRepository: Repository<Player>,
  ) {}

  async create(createPlayerDto: CreatePlayerDto): Promise<Player> {
    const player = this.playersRepository.create(createPlayerDto);
    return this.playersRepository.save(player);
  }

  async findAll(query?: QueryPlayersDto): Promise<Player[]> {
    const searchText = query?.q?.trim();

    if (!searchText) {
      return this.playersRepository.find({
        order: {
          createdAt: 'DESC',
        },
      });
    }

    const pattern = `%${searchText}%`;

    return this.playersRepository.find({
      where: [
        { firstName: ILike(pattern) },
        { lastName: ILike(pattern) },
        { nickname: ILike(pattern) },
      ],
      order: {
        createdAt: 'DESC',
      },
    });
  }

  async findOne(id: string): Promise<Player> {
    const player = await this.playersRepository.findOne({ where: { id } });

    if (!player) {
      throw new NotFoundException(`Player with id ${id} was not found`);
    }

    return player;
  }

  async update(id: string, updatePlayerDto: UpdatePlayerDto): Promise<Player> {
    const player = await this.findOne(id);
    const updatedPlayer = this.playersRepository.merge(player, updatePlayerDto);
    return this.playersRepository.save(updatedPlayer);
  }

  async remove(id: string): Promise<void> {
    const player = await this.findOne(id);
    await this.playersRepository.remove(player);
  }
}
