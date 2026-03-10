import { IsOptional, IsString } from 'class-validator';

export class UpdateRankCategoryDto {
  @IsString()
  @IsOptional()
  code?: string;

  @IsString()
  @IsOptional()
  name?: string;
}
