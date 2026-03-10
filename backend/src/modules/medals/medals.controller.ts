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
import { AwardMedalDto } from './dto/award-medal.dto';
import { CreateMedalDefinitionDto } from './dto/create-medal-definition.dto';
import { UpdateMedalDefinitionDto } from './dto/update-medal-definition.dto';
import { MedalsService } from './medals.service';

type RequestUser = {
  sub?: string;
  id?: string;
};

type RequestWithUser = {
  user?: RequestUser;
};

@Controller()
export class MedalsController {
  constructor(private readonly medalsService: MedalsService) {}

  @Post('medal-definitions')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN)
  createDefinition(@Body() createMedalDefinitionDto: CreateMedalDefinitionDto) {
    return this.medalsService.createDefinition(createMedalDefinitionDto);
  }

  @Get('medal-definitions')
  @UseGuards(JwtAuthGuard)
  findAllDefinitions() {
    return this.medalsService.findAllDefinitions();
  }

  @Get('medal-definitions/:id')
  @UseGuards(JwtAuthGuard)
  findOneDefinition(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.medalsService.findOneDefinition(id);
  }

  @Patch('medal-definitions/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN)
  updateDefinition(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() updateMedalDefinitionDto: UpdateMedalDefinitionDto,
  ) {
    return this.medalsService.updateDefinition(id, updateMedalDefinitionDto);
  }

  @Delete('medal-definitions/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN)
  removeDefinition(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.medalsService.removeDefinition(id);
  }

  @Get('camp-participations/:participationId/medals')
  @UseGuards(JwtAuthGuard)
  findMedalsByParticipation(@Param('participationId', new ParseUUIDPipe()) participationId: string) {
    return this.medalsService.findMedalsByParticipation(participationId);
  }

  @Post('player-medals')
  @UseGuards(JwtAuthGuard)
  awardMedal(@Body() awardMedalDto: AwardMedalDto, @Req() request: RequestWithUser) {
    const awardedBy = request.user?.sub ?? request.user?.id ?? null;
    return this.medalsService.awardMedal(awardMedalDto, awardedBy);
  }

  @Delete('player-medals/:id')
  @UseGuards(JwtAuthGuard)
  removeAward(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.medalsService.removeAward(id);
  }
}
