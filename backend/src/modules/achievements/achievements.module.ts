import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { CampParticipation } from '../camp-participations/entities/camp-participation.entity';
import { AchievementsController } from './achievements.controller';
import { AchievementsService } from './achievements.service';
import { AchievementDefinition } from './entities/achievement-definition.entity';
import { PlayerAchievement } from './entities/player-achievement.entity';

@Module({
  imports: [TypeOrmModule.forFeature([AchievementDefinition, PlayerAchievement, CampParticipation])],
  controllers: [AchievementsController],
  providers: [AchievementsService, JwtAuthGuard, RolesGuard],
  exports: [AchievementsService],
})
export class AchievementsModule {}
