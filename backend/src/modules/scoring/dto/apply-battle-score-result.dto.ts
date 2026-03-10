import { BattleType } from '../../battles/enums/battle-type.enum';

export class ApplyBattleScoreResultDto {
  battleId!: string;
  battleType!: BattleType;
  appliedParticipationCount!: number;
  appliedTeamCount!: number;
  message!: string;
}
