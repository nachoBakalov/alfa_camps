import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CampTeam } from '../camp-teams/entities/camp-team.entity';
import { CampTeamPointAdjustmentsController } from './camp-team-point-adjustments.controller';
import { CampTeamPointAdjustmentsService } from './camp-team-point-adjustments.service';
import { CampTeamPointAdjustment } from './entities/camp-team-point-adjustment.entity';

@Module({
  imports: [TypeOrmModule.forFeature([CampTeamPointAdjustment, CampTeam])],
  controllers: [CampTeamPointAdjustmentsController],
  providers: [CampTeamPointAdjustmentsService, JwtAuthGuard],
  exports: [CampTeamPointAdjustmentsService],
})
export class CampTeamPointAdjustmentsModule {}
