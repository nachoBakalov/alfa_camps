import { IsOptional, IsString, IsUUID } from 'class-validator';

export class AwardMedalDto {
  @IsUUID()
  participationId!: string;

  @IsUUID()
  medalId!: string;

  @IsString()
  @IsOptional()
  note?: string;
}
