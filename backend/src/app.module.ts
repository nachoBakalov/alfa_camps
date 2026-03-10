import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './modules/auth/auth.module';
import { CampParticipationsModule } from './modules/camp-participations/camp-participations.module';
import { CampTeamsModule } from './modules/camp-teams/camp-teams.module';
import { CampsModule } from './modules/camps/camps.module';
import { CampTypesModule } from './modules/camp-types/camp-types.module';
import { HealthModule } from './modules/health/health.module';
import { PlayersModule } from './modules/players/players.module';
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
    AuthModule,
    CampParticipationsModule,
    CampTeamsModule,
    CampsModule,
    CampTypesModule,
    HealthModule,
    PlayersModule,
    TeamTemplatesModule,
    UsersModule,
  ],
})
export class AppModule {}
