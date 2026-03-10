import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CampParticipation } from '../camp-participations/entities/camp-participation.entity';
import { CampTeam } from '../camp-teams/entities/camp-team.entity';
import { Camp } from '../camps/entities/camp.entity';
import { RankingsController } from './rankings.controller';
import { RankingsService } from './rankings.service';

@Module({
  imports: [TypeOrmModule.forFeature([Camp, CampParticipation, CampTeam])],
  controllers: [RankingsController],
  providers: [RankingsService],
  exports: [RankingsService],
})
export class RankingsModule {}
