import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { CampType } from '../camp-types/entities/camp-type.entity';
import { Camp } from './entities/camp.entity';
import { CampsController } from './camps.controller';
import { CampsService } from './camps.service';

@Module({
  imports: [TypeOrmModule.forFeature([Camp, CampType])],
  controllers: [CampsController],
  providers: [CampsService, JwtAuthGuard, RolesGuard],
  exports: [CampsService],
})
export class CampsModule {}
