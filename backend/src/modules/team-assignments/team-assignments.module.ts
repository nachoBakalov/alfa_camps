import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { CampParticipation } from '../camp-participations/entities/camp-participation.entity';
import { CampTeam } from '../camp-teams/entities/camp-team.entity';
import { TeamAssignment } from './entities/team-assignment.entity';
import { TeamAssignmentsController } from './team-assignments.controller';
import { TeamAssignmentsService } from './team-assignments.service';

@Module({
  imports: [TypeOrmModule.forFeature([TeamAssignment, CampParticipation, CampTeam])],
  controllers: [TeamAssignmentsController],
  providers: [TeamAssignmentsService, JwtAuthGuard, RolesGuard],
  exports: [TeamAssignmentsService],
})
export class TeamAssignmentsModule {}
