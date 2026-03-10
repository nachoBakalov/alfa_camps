import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { CampParticipation } from '../camp-participations/entities/camp-participation.entity';
import { MedalDefinition } from './entities/medal-definition.entity';
import { PlayerMedal } from './entities/player-medal.entity';
import { MedalsController } from './medals.controller';
import { MedalsService } from './medals.service';

@Module({
  imports: [TypeOrmModule.forFeature([MedalDefinition, PlayerMedal, CampParticipation])],
  controllers: [MedalsController],
  providers: [MedalsService, JwtAuthGuard, RolesGuard],
  exports: [MedalsService],
})
export class MedalsModule {}
