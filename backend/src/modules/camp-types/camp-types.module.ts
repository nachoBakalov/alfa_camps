import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { CampTypesController } from './camp-types.controller';
import { CampTypesService } from './camp-types.service';
import { CampType } from './entities/camp-type.entity';

@Module({
  imports: [TypeOrmModule.forFeature([CampType])],
  controllers: [CampTypesController],
  providers: [CampTypesService, JwtAuthGuard, RolesGuard],
  exports: [CampTypesService],
})
export class CampTypesModule {}
