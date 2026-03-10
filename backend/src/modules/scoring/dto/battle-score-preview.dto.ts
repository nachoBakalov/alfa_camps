import { BattleType } from '../../battles/enums/battle-type.enum';
import { ParticipationScoreDelta } from '../interfaces/participation-score-delta.interface';
import { TeamScoreDelta } from '../interfaces/team-score-delta.interface';

export class BattleScorePreviewDto {
  battleId!: string;
  battleType!: BattleType;
  participationDeltas!: ParticipationScoreDelta[];
  teamDeltas!: TeamScoreDelta[];
}
