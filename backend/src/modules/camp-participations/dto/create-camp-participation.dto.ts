import { IsUUID } from 'class-validator';

export class CreateCampParticipationDto {
  @IsUUID()
  campId!: string;

  @IsUUID()
  playerId!: string;
}
