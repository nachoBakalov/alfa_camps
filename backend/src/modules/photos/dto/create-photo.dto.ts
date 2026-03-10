import { IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';

export class CreatePhotoDto {
  @IsOptional()
  @IsUUID()
  campId?: string;

  @IsOptional()
  @IsUUID()
  teamId?: string;

  @IsOptional()
  @IsUUID()
  playerId?: string;

  @IsString()
  @IsNotEmpty()
  imageUrl!: string;
}
