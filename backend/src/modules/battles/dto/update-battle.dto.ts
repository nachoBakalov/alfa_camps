import { IsDateString, IsEnum, IsOptional, IsString, IsUUID } from 'class-validator';
import { BattleSession } from '../enums/battle-session.enum';
import { BattleStatus } from '../enums/battle-status.enum';
import { BattleType } from '../enums/battle-type.enum';

export class UpdateBattleDto {
  @IsString()
  @IsOptional()
  title?: string;

  @IsEnum(BattleType)
  @IsOptional()
  battleType?: BattleType;

  @IsDateString()
  @IsOptional()
  battleDate?: string;

  @IsEnum(BattleSession)
  @IsOptional()
  session?: BattleSession;

  @IsUUID()
  @IsOptional()
  winningTeamId?: string;

  @IsEnum(BattleStatus)
  @IsOptional()
  status?: BattleStatus;

  @IsString()
  @IsOptional()
  notes?: string;
}
