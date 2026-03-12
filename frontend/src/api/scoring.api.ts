import { apiGet, apiPost } from './client';
import type { BattleType } from './battles.api';

export type ParticipationScoreDelta = {
  participationId: string;
  killsDelta: number;
  knifeKillsDelta: number;
  survivalsDelta: number;
  duelWinsDelta: number;
  massBattleWinsDelta: number;
  pointsDelta: number;
};

export type TeamScoreDelta = {
  teamId: string;
  teamPointsDelta: number;
};

export type BattleScorePreview = {
  battleId: string;
  battleType: BattleType;
  participationDeltas: ParticipationScoreDelta[];
  teamDeltas: TeamScoreDelta[];
};

export type ApplyBattleScoreResult = {
  battleId: string;
  battleType: BattleType;
  appliedParticipationCount: number;
  appliedTeamCount: number;
  message: string;
};

export type FinalizeCampScoreResult = {
  campId: string;
  finalized: boolean;
  alreadyFinalized: boolean;
  appliedParticipationCount: number;
  message: string;
};

export function getBattleScorePreview(battleId: string): Promise<BattleScorePreview> {
  return apiGet<BattleScorePreview>(`/battles/${battleId}/score-preview`);
}

export function applyBattleScore(battleId: string): Promise<ApplyBattleScoreResult> {
  return apiPost<ApplyBattleScoreResult, Record<string, never>>(`/battles/${battleId}/apply-score`, {});
}

export function finalizeCampScore(campId: string): Promise<FinalizeCampScoreResult> {
  return apiPost<FinalizeCampScoreResult, Record<string, never>>(`/camps/${campId}/finalize-score`, {});
}
