import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { CampTeam } from '../camp-teams/entities/camp-team.entity';
import { Camp } from '../camps/entities/camp.entity';
import { Battle } from './entities/battle.entity';
import { BattlesController } from './battles.controller';
import { BattlesService } from './battles.service';

@Module({
  imports: [TypeOrmModule.forFeature([Battle, Camp, CampTeam])],
  controllers: [BattlesController],
  providers: [BattlesService, JwtAuthGuard, RolesGuard],
  exports: [BattlesService],
})
export class BattlesModule {}
