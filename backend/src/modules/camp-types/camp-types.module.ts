import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Camp } from '../camps/entities/camp.entity';
import { TeamTemplate } from '../team-templates/entities/team-template.entity';
import { CampTypesController } from './camp-types.controller';
import { CampTypesService } from './camp-types.service';
import { CampType } from './entities/camp-type.entity';

@Module({
  imports: [TypeOrmModule.forFeature([CampType, TeamTemplate, Camp])],
  controllers: [CampTypesController],
  providers: [CampTypesService, JwtAuthGuard, RolesGuard],
  exports: [CampTypesService],
})
export class CampTypesModule {}
