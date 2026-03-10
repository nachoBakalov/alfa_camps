import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { CampParticipation } from '../camp-participations/entities/camp-participation.entity';
import { RanksController } from './ranks.controller';
import { RanksService } from './ranks.service';
import { PlayerRank } from './entities/player-rank.entity';
import { RankCategory } from './entities/rank-category.entity';
import { RankDefinition } from './entities/rank-definition.entity';

@Module({
  imports: [TypeOrmModule.forFeature([RankCategory, RankDefinition, PlayerRank, CampParticipation])],
  controllers: [RanksController],
  providers: [RanksService, JwtAuthGuard, RolesGuard],
  exports: [RanksService],
})
export class RanksModule {}
