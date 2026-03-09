import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { CampType } from '../camp-types/entities/camp-type.entity';
import { TeamTemplate } from './entities/team-template.entity';
import { TeamTemplatesController } from './team-templates.controller';
import { TeamTemplatesService } from './team-templates.service';

@Module({
  imports: [TypeOrmModule.forFeature([TeamTemplate, CampType])],
  controllers: [TeamTemplatesController],
  providers: [TeamTemplatesService, JwtAuthGuard, RolesGuard],
  exports: [TeamTemplatesService],
})
export class TeamTemplatesModule {}
