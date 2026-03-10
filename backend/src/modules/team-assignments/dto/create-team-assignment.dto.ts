import { IsDateString, IsOptional, IsString, IsUUID } from 'class-validator';

export class CreateTeamAssignmentDto {
  @IsUUID()
  participationId!: string;

  @IsUUID()
  teamId!: string;

  @IsDateString()
  @IsOptional()
  assignedAt?: string;

  @IsString()
  @IsOptional()
  note?: string;
}
