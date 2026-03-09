import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Camp } from '../camps/entities/camp.entity';
import { TeamTemplate } from '../team-templates/entities/team-template.entity';
import { CampTeam } from './entities/camp-team.entity';
import { CampTeamsController } from './camp-teams.controller';
import { CampTeamsService } from './camp-teams.service';

@Module({
  imports: [TypeOrmModule.forFeature([CampTeam, Camp, TeamTemplate])],
  controllers: [CampTeamsController],
  providers: [CampTeamsService, JwtAuthGuard, RolesGuard],
  exports: [CampTeamsService],
})
export class CampTeamsModule {}
