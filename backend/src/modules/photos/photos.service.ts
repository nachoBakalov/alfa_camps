import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CampTeam } from '../camp-teams/entities/camp-team.entity';
import { Camp } from '../camps/entities/camp.entity';
import { Player } from '../players/entities/player.entity';
import { CreatePhotoDto } from './dto/create-photo.dto';
import { Photo } from './entities/photo.entity';

@Injectable()
export class PhotosService {
  constructor(
    @InjectRepository(Photo)
    private readonly photosRepository: Repository<Photo>,
    @InjectRepository(Camp)
    private readonly campsRepository: Repository<Camp>,
    @InjectRepository(CampTeam)
    private readonly campTeamsRepository: Repository<CampTeam>,
    @InjectRepository(Player)
    private readonly playersRepository: Repository<Player>,
  ) {}

  async create(createPhotoDto: CreatePhotoDto, uploadedBy?: string | null): Promise<Photo> {
    if (!createPhotoDto.campId && !createPhotoDto.teamId && !createPhotoDto.playerId) {
      throw new BadRequestException('At least one target id (campId, teamId or playerId) is required');
    }

    const camp = createPhotoDto.campId
      ? await this.campsRepository.findOne({ where: { id: createPhotoDto.campId } })
      : null;

    if (createPhotoDto.campId && !camp) {
      throw new NotFoundException(`Camp with id ${createPhotoDto.campId} was not found`);
    }

    const team = createPhotoDto.teamId
      ? await this.campTeamsRepository.findOne({ where: { id: createPhotoDto.teamId } })
      : null;

    if (createPhotoDto.teamId && !team) {
      throw new NotFoundException(`Camp team with id ${createPhotoDto.teamId} was not found`);
    }

    const player = createPhotoDto.playerId
      ? await this.playersRepository.findOne({ where: { id: createPhotoDto.playerId } })
      : null;

    if (createPhotoDto.playerId && !player) {
      throw new NotFoundException(`Player with id ${createPhotoDto.playerId} was not found`);
    }

    if (camp && team && team.campId !== camp.id) {
      throw new BadRequestException('Provided teamId does not belong to provided campId');
    }

    const photo = this.photosRepository.create({
      campId: createPhotoDto.campId ?? null,
      teamId: createPhotoDto.teamId ?? null,
      playerId: createPhotoDto.playerId ?? null,
      imageUrl: createPhotoDto.imageUrl,
      uploadedBy: uploadedBy ?? null,
    });

    return this.photosRepository.save(photo);
  }

  async findOne(id: string): Promise<Photo> {
    const photo = await this.photosRepository.findOne({ where: { id } });

    if (!photo) {
      throw new NotFoundException(`Photo with id ${id} was not found`);
    }

    return photo;
  }

  async remove(id: string): Promise<void> {
    const photo = await this.findOne(id);
    await this.photosRepository.remove(photo);
  }

  async findByCamp(campId: string): Promise<Photo[]> {
    await this.ensureCampExists(campId);

    return this.photosRepository.find({
      where: { campId },
      order: { createdAt: 'DESC' },
    });
  }

  async findByTeam(teamId: string): Promise<Photo[]> {
    await this.ensureTeamExists(teamId);

    return this.photosRepository.find({
      where: { teamId },
      order: { createdAt: 'DESC' },
    });
  }

  async findByPlayer(playerId: string): Promise<Photo[]> {
    await this.ensurePlayerExists(playerId);

    return this.photosRepository.find({
      where: { playerId },
      order: { createdAt: 'DESC' },
    });
  }

  private async ensureCampExists(campId: string): Promise<void> {
    const camp = await this.campsRepository.findOne({ where: { id: campId } });

    if (!camp) {
      throw new NotFoundException(`Camp with id ${campId} was not found`);
    }
  }

  private async ensureTeamExists(teamId: string): Promise<void> {
    const team = await this.campTeamsRepository.findOne({ where: { id: teamId } });

    if (!team) {
      throw new NotFoundException(`Camp team with id ${teamId} was not found`);
    }
  }

  private async ensurePlayerExists(playerId: string): Promise<void> {
    const player = await this.playersRepository.findOne({ where: { id: playerId } });

    if (!player) {
      throw new NotFoundException(`Player with id ${playerId} was not found`);
    }
  }
}
