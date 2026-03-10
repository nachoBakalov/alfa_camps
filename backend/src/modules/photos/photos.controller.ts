import { Body, Controller, Delete, Get, Param, ParseUUIDPipe, Post, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CreatePhotoDto } from './dto/create-photo.dto';
import { PhotosService } from './photos.service';

type RequestUser = {
  sub?: string;
  id?: string;
};

type RequestWithUser = {
  user?: RequestUser;
};

@Controller()
export class PhotosController {
  constructor(private readonly photosService: PhotosService) {}

  @Post('photos')
  @UseGuards(JwtAuthGuard)
  create(@Body() createPhotoDto: CreatePhotoDto, @Req() request: RequestWithUser) {
    const uploadedBy = request.user?.sub ?? request.user?.id ?? null;
    return this.photosService.create(createPhotoDto, uploadedBy);
  }

  @Delete('photos/:id')
  @UseGuards(JwtAuthGuard)
  remove(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.photosService.remove(id);
  }

  @Get('camps/:campId/photos')
  findByCamp(@Param('campId', new ParseUUIDPipe()) campId: string) {
    return this.photosService.findByCamp(campId);
  }

  @Get('teams/:teamId/photos')
  findByTeam(@Param('teamId', new ParseUUIDPipe()) teamId: string) {
    return this.photosService.findByTeam(teamId);
  }

  @Get('players/:playerId/photos')
  findByPlayer(@Param('playerId', new ParseUUIDPipe()) playerId: string) {
    return this.photosService.findByPlayer(playerId);
  }
}
