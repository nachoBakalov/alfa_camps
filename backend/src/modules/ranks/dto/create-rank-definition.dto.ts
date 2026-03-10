import { IsInt, IsOptional, IsString, IsUUID, Min } from 'class-validator';

export class CreateRankDefinitionDto {
  @IsUUID()
  categoryId!: string;

  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  iconUrl?: string;

  @IsInt()
  @Min(0)
  threshold!: number;

  @IsInt()
  rankOrder!: number;
}
