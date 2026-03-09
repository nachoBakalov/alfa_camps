import {
  IsDateString,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';
import { CampStatus } from '../enums/camp-status.enum';

export class UpdateCampDto {
  @IsUUID()
  @IsOptional()
  campTypeId?: string;

  @IsString()
  @IsOptional()
  title?: string;

  @IsInt()
  @IsOptional()
  year?: number;

  @IsDateString()
  @IsOptional()
  startDate?: string;

  @IsDateString()
  @IsOptional()
  endDate?: string;

  @IsString()
  @IsOptional()
  location?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  logoUrl?: string;

  @IsString()
  @IsOptional()
  coverImageUrl?: string;

  @IsEnum(CampStatus)
  @IsOptional()
  status?: CampStatus;
}
