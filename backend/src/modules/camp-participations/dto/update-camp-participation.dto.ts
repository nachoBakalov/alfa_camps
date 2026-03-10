import { IsInt, IsOptional, Min } from 'class-validator';

export class UpdateCampParticipationDto {
  @IsInt()
  @Min(0)
  @IsOptional()
  kills?: number;

  @IsInt()
  @Min(0)
  @IsOptional()
  knifeKills?: number;

  @IsInt()
  @Min(0)
  @IsOptional()
  survivals?: number;

  @IsInt()
  @Min(0)
  @IsOptional()
  duelWins?: number;

  @IsInt()
  @Min(0)
  @IsOptional()
  massBattleWins?: number;

  @IsInt()
  @Min(0)
  @IsOptional()
  points?: number;
}
