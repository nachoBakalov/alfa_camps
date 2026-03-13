import { IsOptional, IsUUID } from 'class-validator';

export class CreatePhotoUploadDto {
  @IsOptional()
  @IsUUID()
  campId?: string;

  @IsOptional()
  @IsUUID()
  teamId?: string;

  @IsOptional()
  @IsUUID()
  playerId?: string;
}
