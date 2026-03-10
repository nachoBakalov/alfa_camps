import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Camp } from '../camps/entities/camp.entity';
import { Player } from '../players/entities/player.entity';
import { CampParticipationsController } from './camp-participations.controller';
import { CampParticipationsService } from './camp-participations.service';
import { CampParticipation } from './entities/camp-participation.entity';

@Module({
  imports: [TypeOrmModule.forFeature([CampParticipation, Camp, Player])],
  controllers: [CampParticipationsController],
  providers: [CampParticipationsService, JwtAuthGuard, RolesGuard],
  exports: [CampParticipationsService],
})
export class CampParticipationsModule {}
