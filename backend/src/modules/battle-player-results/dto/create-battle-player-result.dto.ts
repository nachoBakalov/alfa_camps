import {
  IsBoolean,
  IsInt,
  IsOptional,
  IsUUID,
  Min,
} from 'class-validator';

export class CreateBattlePlayerResultDto {
  @IsUUID()
  battleId!: string;

  @IsUUID()
  participationId!: string;

  @IsUUID()
  teamId!: string;

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
