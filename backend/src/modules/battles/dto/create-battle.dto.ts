import {
  IsDateString,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';
import { BattleSession } from '../enums/battle-session.enum';
import { BattleType } from '../enums/battle-type.enum';

export class CreateBattleDto {
  @IsUUID()
  campId!: string;

  @IsString()
  @IsNotEmpty()
  title!: string;

  @IsEnum(BattleType)
  battleType!: BattleType;

  @IsDateString()
  battleDate!: string;

  @IsEnum(BattleSession)
  @IsOptional()
  session?: BattleSession;

  @IsUUID()
  @IsOptional()
  winningTeamId?: string;

  @IsString()
  @IsOptional()
  notes?: string;
}
