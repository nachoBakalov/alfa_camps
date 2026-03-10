import { IsOptional, IsUUID } from 'class-validator';

export class UpdateDuelDto {
  @IsUUID()
  @IsOptional()
  winnerParticipationId?: string;
}
