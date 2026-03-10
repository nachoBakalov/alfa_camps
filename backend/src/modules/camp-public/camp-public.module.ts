import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CampParticipation } from '../camp-participations/entities/camp-participation.entity';
import { CampTeam } from '../camp-teams/entities/camp-team.entity';
import { Camp } from '../camps/entities/camp.entity';
import { TeamAssignment } from '../team-assignments/entities/team-assignment.entity';
import { CampPublicController } from './camp-public.controller';
import { CampPublicService } from './camp-public.service';

@Module({
  imports: [TypeOrmModule.forFeature([Camp, CampTeam, CampParticipation, TeamAssignment])],
  controllers: [CampPublicController],
  providers: [CampPublicService],
  exports: [CampPublicService],
})
export class CampPublicModule {}
