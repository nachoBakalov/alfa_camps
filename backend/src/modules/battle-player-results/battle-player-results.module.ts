import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Battle } from '../battles/entities/battle.entity';
import { CampParticipation } from '../camp-participations/entities/camp-participation.entity';
import { CampTeam } from '../camp-teams/entities/camp-team.entity';
import { BattlePlayerResultsController } from './battle-player-results.controller';
import { BattlePlayerResultsService } from './battle-player-results.service';
import { BattlePlayerResult } from './entities/battle-player-result.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([BattlePlayerResult, Battle, CampParticipation, CampTeam]),
  ],
  controllers: [BattlePlayerResultsController],
  providers: [BattlePlayerResultsService, JwtAuthGuard, RolesGuard],
  exports: [BattlePlayerResultsService],
})
export class BattlePlayerResultsModule {}
