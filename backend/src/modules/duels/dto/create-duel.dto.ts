import { IsOptional, IsUUID } from 'class-validator';

export class CreateDuelDto {
  @IsUUID()
  battleId!: string;

  @IsUUID()
  playerAParticipationId!: string;

  @IsUUID()
  playerBParticipationId!: string;

  @IsUUID()
  @IsOptional()
  winnerParticipationId?: string;
}
