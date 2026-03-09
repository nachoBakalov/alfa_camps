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
import { CampTeamsService } from './camp-teams.service';
import { CloneCampTypeTemplatesDto } from './dto/clone-camp-type-templates.dto';
import { CreateCampTeamDto } from './dto/create-camp-team.dto';
import { UpdateCampTeamDto } from './dto/update-camp-team.dto';

@Controller()
export class CampTeamsController {
  constructor(private readonly campTeamsService: CampTeamsService) {}

  @Post('camp-teams')
  @UseGuards(JwtAuthGuard)
  create(@Body() createCampTeamDto: CreateCampTeamDto) {
    return this.campTeamsService.create(createCampTeamDto);
  }

  @Get('camp-teams')
  @UseGuards(JwtAuthGuard)
  findAll() {
    return this.campTeamsService.findAll();
  }

  @Get('camp-teams/:id')
  @UseGuards(JwtAuthGuard)
  findOne(@Param('id') id: string) {
    return this.campTeamsService.findOne(id);
  }

  @Get('camps/:campId/camp-teams')
  @UseGuards(JwtAuthGuard)
  findByCamp(@Param('campId') campId: string) {
    return this.campTeamsService.findByCamp(campId);
  }

  @Patch('camp-teams/:id')
  @UseGuards(JwtAuthGuard)
  update(@Param('id') id: string, @Body() updateCampTeamDto: UpdateCampTeamDto) {
    return this.campTeamsService.update(id, updateCampTeamDto);
  }

  @Delete('camp-teams/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN)
  remove(@Param('id') id: string) {
    return this.campTeamsService.remove(id);
  }

  @Post('camps/:campId/camp-teams/clone-from-templates')
  @UseGuards(JwtAuthGuard)
  cloneFromCampTypeTemplates(
    @Param('campId') campId: string,
    @Body() _dto: CloneCampTypeTemplatesDto,
  ) {
    return this.campTeamsService.cloneFromCampTypeTemplates(campId);
  }
}
