import { IsDateString, IsOptional, IsString } from 'class-validator';

export class UpdateTeamAssignmentDto {
  @IsDateString()
  @IsOptional()
  assignedAt?: string;

  @IsString()
  @IsOptional()
  note?: string;
}
