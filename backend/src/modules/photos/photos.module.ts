import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CampTeam } from '../camp-teams/entities/camp-team.entity';
import { Camp } from '../camps/entities/camp.entity';
import { Player } from '../players/entities/player.entity';
import { PhotosController } from './photos.controller';
import { Photo } from './entities/photo.entity';
import { PhotosService } from './photos.service';

@Module({
  imports: [TypeOrmModule.forFeature([Photo, Camp, CampTeam, Player])],
  controllers: [PhotosController],
  providers: [PhotosService],
  exports: [PhotosService],
})
export class PhotosModule {}
