import {
  IsBoolean,
  IsInt,
  IsOptional,
  IsString,
} from 'class-validator';

export class UpdateCampTeamDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  color?: string;

  @IsString()
  @IsOptional()
  logoUrl?: string;

  @IsInt()
  @IsOptional()
  finalPosition?: number;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
