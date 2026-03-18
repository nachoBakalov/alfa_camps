import { IsInt, IsOptional, IsString, IsUUID, NotEquals } from 'class-validator';

export class CreateCampTeamPointAdjustmentDto {
  @IsUUID()
  campTeamId!: string;

  @IsInt()
  @NotEquals(0)
  delta!: number;

  @IsString()
  @IsOptional()
  reason?: string;
}
