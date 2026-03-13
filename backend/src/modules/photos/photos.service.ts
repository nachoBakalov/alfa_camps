import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { randomBytes } from 'crypto';
import * as fs from 'fs/promises';
import * as path from 'path';
import { Repository } from 'typeorm';
import { CampTeam } from '../camp-teams/entities/camp-team.entity';
import { Camp } from '../camps/entities/camp.entity';
import { Player } from '../players/entities/player.entity';
import { CreatePhotoDto } from './dto/create-photo.dto';
import { CreatePhotoUploadDto } from './dto/create-photo-upload.dto';
import { Photo } from './entities/photo.entity';
import { UploadedImageFile } from './types/uploaded-image-file.type';

const ALLOWED_IMAGE_MIME_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp']);
const MAX_UPLOAD_FILE_SIZE_BYTES = 5 * 1024 * 1024;

@Injectable()
export class PhotosService {
  private readonly uploadsRootPath = path.join(process.cwd(), 'uploads');

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
    await this.validateTargets(createPhotoDto);

    const photo = this.photosRepository.create({
      campId: createPhotoDto.campId ?? null,
      teamId: createPhotoDto.teamId ?? null,
      playerId: createPhotoDto.playerId ?? null,
      imageUrl: createPhotoDto.imageUrl,
      uploadedBy: uploadedBy ?? null,
    });

    return this.photosRepository.save(photo);
  }

  async createFromUpload(
    createPhotoUploadDto: CreatePhotoUploadDto,
    file: UploadedImageFile,
    uploadedBy?: string | null,
  ): Promise<Photo> {
    await this.validateTargets(createPhotoUploadDto);
    this.validateUploadedFile(file);

    const targetFolderPath = this.getUploadTargetFolderPath(createPhotoUploadDto);
    const generatedFileName = this.generateSafeFileName(file.originalname, file.mimetype);
    const relativeFilePath = path.join(targetFolderPath, generatedFileName);
    const absoluteFilePath = path.join(this.uploadsRootPath, relativeFilePath);

    await fs.mkdir(path.dirname(absoluteFilePath), { recursive: true });
    await fs.writeFile(absoluteFilePath, file.buffer);

    const imageUrl = `/uploads/${relativeFilePath.replace(/\\/g, '/')}`;

    try {
      const photo = this.photosRepository.create({
        campId: createPhotoUploadDto.campId ?? null,
        teamId: createPhotoUploadDto.teamId ?? null,
        playerId: createPhotoUploadDto.playerId ?? null,
        imageUrl,
        uploadedBy: uploadedBy ?? null,
      });

      return await this.photosRepository.save(photo);
    } catch (error) {
      await fs.unlink(absoluteFilePath).catch(() => undefined);
      throw error;
    }
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

  private async validateTargets(target: {
    campId?: string;
    teamId?: string;
    playerId?: string;
  }): Promise<void> {
    if (!target.campId && !target.teamId && !target.playerId) {
      throw new BadRequestException('At least one target id (campId, teamId or playerId) is required');
    }

    const camp = target.campId ? await this.campsRepository.findOne({ where: { id: target.campId } }) : null;

    if (target.campId && !camp) {
      throw new NotFoundException(`Camp with id ${target.campId} was not found`);
    }

    const team = target.teamId ? await this.campTeamsRepository.findOne({ where: { id: target.teamId } }) : null;

    if (target.teamId && !team) {
      throw new NotFoundException(`Camp team with id ${target.teamId} was not found`);
    }

    const player = target.playerId ? await this.playersRepository.findOne({ where: { id: target.playerId } }) : null;

    if (target.playerId && !player) {
      throw new NotFoundException(`Player with id ${target.playerId} was not found`);
    }

    if (camp && team && team.campId !== camp.id) {
      throw new BadRequestException('Provided teamId does not belong to provided campId');
    }
  }

  private validateUploadedFile(file: UploadedImageFile): void {
    if (!file) {
      throw new BadRequestException('Image file is required');
    }

    if (!ALLOWED_IMAGE_MIME_TYPES.has(file.mimetype)) {
      throw new BadRequestException('Unsupported file type. Allowed types: image/jpeg, image/png, image/webp');
    }

    if (file.size > MAX_UPLOAD_FILE_SIZE_BYTES) {
      throw new BadRequestException(`File size exceeds ${MAX_UPLOAD_FILE_SIZE_BYTES} bytes limit`);
    }
  }

  private getUploadTargetFolderPath(target: {
    campId?: string;
    teamId?: string;
    playerId?: string;
  }): string {
    // Explicit priority: player > team > camp.
    if (target.playerId) {
      return path.join('players', target.playerId);
    }

    if (target.teamId) {
      return path.join('teams', target.teamId);
    }

    if (target.campId) {
      return path.join('camps', target.campId);
    }

    throw new BadRequestException('At least one target id (campId, teamId or playerId) is required');
  }

  private generateSafeFileName(originalName: string, mimeType: string): string {
    const timestamp = Date.now();
    const randomSuffix = randomBytes(6).toString('hex');
    const extension = this.getFileExtension(originalName, mimeType);

    return `${timestamp}-${randomSuffix}${extension}`;
  }

  private getFileExtension(originalName: string, mimeType: string): string {
    const originalExtension = path.extname(originalName).toLowerCase();

    if (originalExtension === '.jpg' || originalExtension === '.jpeg' || originalExtension === '.png' || originalExtension === '.webp') {
      return originalExtension;
    }

    if (mimeType === 'image/jpeg') {
      return '.jpg';
    }

    if (mimeType === 'image/png') {
      return '.png';
    }

    return '.webp';
  }
}
