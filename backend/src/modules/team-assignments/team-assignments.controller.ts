import {
  Body,
  Controller,
  Delete,
  Get,
  ParseUUIDPipe,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { Roles } from '../../common/decorators/roles.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { UserRole } from '../users/enums/user-role.enum';
import { CreateTeamAssignmentDto } from './dto/create-team-assignment.dto';
import { UpdateTeamAssignmentDto } from './dto/update-team-assignment.dto';
import { TeamAssignmentsService } from './team-assignments.service';

type RequestUser = {
  sub?: string;
  id?: string;
};

type RequestWithUser = {
  user?: RequestUser;
};

@Controller()
export class TeamAssignmentsController {
  constructor(private readonly teamAssignmentsService: TeamAssignmentsService) {}

  @Post('team-assignments')
  @UseGuards(JwtAuthGuard)
  create(
    @Body() createTeamAssignmentDto: CreateTeamAssignmentDto,
    @Req() request: RequestWithUser,
  ) {
    const assignedBy = request.user?.sub ?? request.user?.id ?? null;
    return this.teamAssignmentsService.create(createTeamAssignmentDto, assignedBy);
  }

  @Get('team-assignments')
  @UseGuards(JwtAuthGuard)
  findAll() {
    return this.teamAssignmentsService.findAll();
  }

  @Get('team-assignments/:id')
  @UseGuards(JwtAuthGuard)
  findOne(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.teamAssignmentsService.findOne(id);
  }

  @Patch('team-assignments/:id')
  @UseGuards(JwtAuthGuard)
  update(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() updateTeamAssignmentDto: UpdateTeamAssignmentDto,
  ) {
    return this.teamAssignmentsService.update(id, updateTeamAssignmentDto);
  }

  @Delete('team-assignments/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN)
  remove(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.teamAssignmentsService.remove(id);
  }

  @Get('camp-participations/:participationId/team-assignments')
  @UseGuards(JwtAuthGuard)
  findByParticipation(@Param('participationId', new ParseUUIDPipe()) participationId: string) {
    return this.teamAssignmentsService.findByParticipation(participationId);
  }

  @Get('camp-participations/:participationId/current-team-assignment')
  @UseGuards(JwtAuthGuard)
  findCurrentByParticipation(@Param('participationId', new ParseUUIDPipe()) participationId: string) {
    return this.teamAssignmentsService.findCurrentByParticipation(participationId);
  }
}
