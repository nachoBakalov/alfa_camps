import {
  IsBoolean,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';

export class CreateCampTeamDto {
  @IsUUID()
  campId!: string;

  @IsString()
  @IsNotEmpty()
  name!: string;

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
