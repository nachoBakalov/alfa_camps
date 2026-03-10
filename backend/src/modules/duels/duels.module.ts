import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Battle } from '../battles/entities/battle.entity';
import { CampParticipation } from '../camp-participations/entities/camp-participation.entity';
import { DuelsController } from './duels.controller';
import { DuelsService } from './duels.service';
import { Duel } from './entities/duel.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Duel, Battle, CampParticipation])],
  controllers: [DuelsController],
  providers: [DuelsService, JwtAuthGuard, RolesGuard],
  exports: [DuelsService],
})
export class DuelsModule {}
