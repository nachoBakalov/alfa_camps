import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CreateCampTeamPointAdjustmentDto } from './dto/create-camp-team-point-adjustment.dto';
import { CampTeamPointAdjustmentsService } from './camp-team-point-adjustments.service';

type RequestUser = {
  sub?: string;
  id?: string;
};

type RequestWithUser = {
  user?: RequestUser;
};

@Controller()
export class CampTeamPointAdjustmentsController {
  constructor(private readonly adjustmentsService: CampTeamPointAdjustmentsService) {}

  @Post('camp-team-point-adjustments')
  @UseGuards(JwtAuthGuard)
  create(
    @Body() createDto: CreateCampTeamPointAdjustmentDto,
    @Req() request: RequestWithUser,
  ) {
    const createdBy = request.user?.sub ?? request.user?.id ?? null;
    return this.adjustmentsService.create(createDto, createdBy);
  }

  @Get('camp-teams/:teamId/point-adjustments')
  @UseGuards(JwtAuthGuard)
  findByTeam(@Param('teamId', new ParseUUIDPipe()) teamId: string) {
    return this.adjustmentsService.findByTeam(teamId);
  }
}
