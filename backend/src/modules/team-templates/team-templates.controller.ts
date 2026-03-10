import {
  Body,
  Controller,
  Delete,
  Get,
  ParseUUIDPipe,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { Roles } from '../../common/decorators/roles.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { UserRole } from '../users/enums/user-role.enum';
import { CreateTeamTemplateDto } from './dto/create-team-template.dto';
import { UpdateTeamTemplateDto } from './dto/update-team-template.dto';
import { TeamTemplatesService } from './team-templates.service';

@Controller()
export class TeamTemplatesController {
  constructor(private readonly teamTemplatesService: TeamTemplatesService) {}

  @Post('team-templates')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN)
  create(@Body() createTeamTemplateDto: CreateTeamTemplateDto) {
    return this.teamTemplatesService.create(createTeamTemplateDto);
  }

  @Get('team-templates')
  @UseGuards(JwtAuthGuard)
  findAll() {
    return this.teamTemplatesService.findAll();
  }

  @Get('team-templates/:id')
  @UseGuards(JwtAuthGuard)
  findOne(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.teamTemplatesService.findOne(id);
  }

  @Get('camp-types/:campTypeId/team-templates')
  @UseGuards(JwtAuthGuard)
  findByCampType(@Param('campTypeId', new ParseUUIDPipe()) campTypeId: string) {
    return this.teamTemplatesService.findByCampType(campTypeId);
  }

  @Patch('team-templates/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN)
  update(@Param('id', new ParseUUIDPipe()) id: string, @Body() updateTeamTemplateDto: UpdateTeamTemplateDto) {
    return this.teamTemplatesService.update(id, updateTeamTemplateDto);
  }

  @Delete('team-templates/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN)
  remove(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.teamTemplatesService.remove(id);
  }
}
