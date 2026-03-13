import {
  Body,
  Controller,
  Delete,
  Get,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  ParseFilePipeBuilder,
  Post,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CreatePhotoDto } from './dto/create-photo.dto';
import { CreatePhotoUploadDto } from './dto/create-photo-upload.dto';
import { PhotosService } from './photos.service';
import { UploadedImageFile } from './types/uploaded-image-file.type';

type RequestUser = {
  sub?: string;
  id?: string;
};

type RequestWithUser = {
  user?: RequestUser;
};

const MAX_UPLOAD_FILE_SIZE_BYTES = 5 * 1024 * 1024;

@Controller()
export class PhotosController {
  constructor(private readonly photosService: PhotosService) {}

  @Post('photos')
  @UseGuards(JwtAuthGuard)
  create(@Body() createPhotoDto: CreatePhotoDto, @Req() request: RequestWithUser) {
    const uploadedBy = request.user?.sub ?? request.user?.id ?? null;
    return this.photosService.create(createPhotoDto, uploadedBy);
  }

  @Post('photos/upload')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(
    FileInterceptor('file', {
      limits: {
        fileSize: MAX_UPLOAD_FILE_SIZE_BYTES,
      },
    }),
  )
  upload(
    @UploadedFile(
      new ParseFilePipeBuilder()
        .addMaxSizeValidator({
          maxSize: MAX_UPLOAD_FILE_SIZE_BYTES,
        })
        .addFileTypeValidator({
          fileType: /^image\/(jpeg|png|webp)$/,
        })
        .build({
          fileIsRequired: true,
          errorHttpStatusCode: HttpStatus.BAD_REQUEST,
        }),
    )
    file: UploadedImageFile,
    @Body() createPhotoUploadDto: CreatePhotoUploadDto,
    @Req() request: RequestWithUser,
  ) {
    const uploadedBy = request.user?.sub ?? request.user?.id ?? null;
    return this.photosService.createFromUpload(createPhotoUploadDto, file, uploadedBy);
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
