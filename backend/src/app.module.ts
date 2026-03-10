import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AchievementsModule } from './modules/achievements/achievements.module';
import { AuthModule } from './modules/auth/auth.module';
import { BattlePlayerResultsModule } from './modules/battle-player-results/battle-player-results.module';
import { BattlesModule } from './modules/battles/battles.module';
import { CampParticipationsModule } from './modules/camp-participations/camp-participations.module';
import { CampPublicModule } from './modules/camp-public/camp-public.module';
import { CampTeamsModule } from './modules/camp-teams/camp-teams.module';
import { CampsModule } from './modules/camps/camps.module';
import { CampTypesModule } from './modules/camp-types/camp-types.module';
import { HealthModule } from './modules/health/health.module';
import { MedalsModule } from './modules/medals/medals.module';
import { PlayersModule } from './modules/players/players.module';
import { PlayerProfilesModule } from './modules/player-profiles/player-profiles.module';
import { PhotosModule } from './modules/photos/photos.module';
import { DuelsModule } from './modules/duels/duels.module';
import { RankingsModule } from './modules/rankings/rankings.module';
import { ScoringModule } from './modules/scoring/scoring.module';
import { RanksModule } from './modules/ranks/ranks.module';
import { TeamAssignmentsModule } from './modules/team-assignments/team-assignments.module';
import { TeamTemplatesModule } from './modules/team-templates/team-templates.module';
import { UsersModule } from './modules/users/users.module';
import { validateEnv } from './common/config/env.validation';
import { typeOrmConfigFactory } from './common/config/typeorm.config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validate: validateEnv,
    }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: typeOrmConfigFactory,
    }),
    AchievementsModule,
    AuthModule,
    BattlePlayerResultsModule,
    BattlesModule,
    CampParticipationsModule,
    CampPublicModule,
    CampTeamsModule,
    CampsModule,
    CampTypesModule,
    DuelsModule,
    HealthModule,
    MedalsModule,
    PlayersModule,
    PlayerProfilesModule,
    PhotosModule,
    RankingsModule,
    RanksModule,
    ScoringModule,
    TeamAssignmentsModule,
    TeamTemplatesModule,
    UsersModule,
  ],
})
export class AppModule {}
