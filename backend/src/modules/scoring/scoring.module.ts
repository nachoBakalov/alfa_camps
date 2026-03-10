import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { BattlePlayerResult } from '../battle-player-results/entities/battle-player-result.entity';
import { Battle } from '../battles/entities/battle.entity';
import { Camp } from '../camps/entities/camp.entity';
import { CampParticipation } from '../camp-participations/entities/camp-participation.entity';
import { CampTeam } from '../camp-teams/entities/camp-team.entity';
import { Duel } from '../duels/entities/duel.entity';
import { TeamAssignment } from '../team-assignments/entities/team-assignment.entity';
import { BattleParticipationScoreLedger } from './entities/battle-participation-score-ledger.entity';
import { BattleTeamScoreLedger } from './entities/battle-team-score-ledger.entity';
import { CampFinalizationLedger } from './entities/camp-finalization-ledger.entity';
import { ScoringController } from './scoring.controller';
import { ScoringService } from './scoring.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Battle,
      Camp,
      BattlePlayerResult,
      Duel,
      CampParticipation,
      CampTeam,
      TeamAssignment,
      BattleParticipationScoreLedger,
      BattleTeamScoreLedger,
      CampFinalizationLedger,
    ]),
  ],
  controllers: [ScoringController],
  providers: [ScoringService, JwtAuthGuard],
  exports: [ScoringService],
})
export class ScoringModule {}
