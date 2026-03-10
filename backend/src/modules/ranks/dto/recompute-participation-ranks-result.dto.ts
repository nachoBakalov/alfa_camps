export class RecomputeParticipationRanksResultDto {
  participationId!: string;
  updatedRanks!: Array<{ categoryCode: string; rankDefinitionId: string }>;
  unchangedRanksCount!: number;
  createdRanksCount!: number;
}
