import { IsInt, IsOptional, IsString, Min } from 'class-validator';

export class UpdateRankDefinitionDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  iconUrl?: string;

  @IsInt()
  @Min(0)
  @IsOptional()
  threshold?: number;

  @IsInt()
  @IsOptional()
  rankOrder?: number;
}
