import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { Roles } from '../../common/decorators/roles.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { UserRole } from '../users/enums/user-role.enum';
import { CampParticipationsService } from './camp-participations.service';
import { CreateCampParticipationDto } from './dto/create-camp-participation.dto';
import { UpdateCampParticipationDto } from './dto/update-camp-participation.dto';

@Controller()
export class CampParticipationsController {
  constructor(
    private readonly campParticipationsService: CampParticipationsService,
  ) {}

  @Post('camp-participations')
  @UseGuards(JwtAuthGuard)
  create(@Body() createCampParticipationDto: CreateCampParticipationDto) {
    return this.campParticipationsService.create(createCampParticipationDto);
  }

  @Get('camp-participations')
  @UseGuards(JwtAuthGuard)
  findAll() {
    return this.campParticipationsService.findAll();
  }

  @Get('camp-participations/:id')
  @UseGuards(JwtAuthGuard)
  findOne(@Param('id') id: string) {
    return this.campParticipationsService.findOne(id);
  }

  @Patch('camp-participations/:id')
  @UseGuards(JwtAuthGuard)
  update(
    @Param('id') id: string,
    @Body() updateCampParticipationDto: UpdateCampParticipationDto,
  ) {
    return this.campParticipationsService.update(id, updateCampParticipationDto);
  }

  @Delete('camp-participations/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN)
  remove(@Param('id') id: string) {
    return this.campParticipationsService.remove(id);
  }

  @Get('camps/:campId/participations')
  @UseGuards(JwtAuthGuard)
  findByCamp(@Param('campId') campId: string) {
    return this.campParticipationsService.findByCamp(campId);
  }

  @Get('players/:playerId/participations')
  @UseGuards(JwtAuthGuard)
  findByPlayer(@Param('playerId') playerId: string) {
    return this.campParticipationsService.findByPlayer(playerId);
  }
}
