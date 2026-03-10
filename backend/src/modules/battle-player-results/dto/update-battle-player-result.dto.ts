import {
  IsBoolean,
  IsInt,
  IsOptional,
  IsUUID,
  Min,
} from 'class-validator';

export class UpdateBattlePlayerResultDto {
  @IsUUID()
  @IsOptional()
  teamId?: string;

  @IsInt()
  @Min(0)
  @IsOptional()
  kills?: number;

  @IsInt()
  @Min(0)
  @IsOptional()
  knifeKills?: number;

  @IsBoolean()
  @IsOptional()
  survived?: boolean;
}
