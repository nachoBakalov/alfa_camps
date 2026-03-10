import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PlayerAchievement } from '../achievements/entities/player-achievement.entity';
import { CampParticipation } from '../camp-participations/entities/camp-participation.entity';
import { PlayerMedal } from '../medals/entities/player-medal.entity';
import { Player } from '../players/entities/player.entity';
import { PlayerRank } from '../ranks/entities/player-rank.entity';
import { TeamAssignment } from '../team-assignments/entities/team-assignment.entity';
import { PlayerProfilesController } from './player-profiles.controller';
import { PlayerProfilesService } from './player-profiles.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Player,
      CampParticipation,
      TeamAssignment,
      PlayerRank,
      PlayerAchievement,
      PlayerMedal,
    ]),
  ],
  controllers: [PlayerProfilesController],
  providers: [PlayerProfilesService],
  exports: [PlayerProfilesService],
})
export class PlayerProfilesModule {}
