import {
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';

export class UpdateTeamTemplateDto {
  @IsUUID()
  @IsOptional()
  campTypeId?: string;

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
  sortOrder?: number;
}
