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
import { AchievementsService } from './achievements.service';
import { CreateAchievementDefinitionDto } from './dto/create-achievement-definition.dto';
import { UnlockParticipationAchievementsResultDto } from './dto/unlock-participation-achievements-result.dto';
import { UpdateAchievementDefinitionDto } from './dto/update-achievement-definition.dto';

@Controller()
export class AchievementsController {
  constructor(private readonly achievementsService: AchievementsService) {}

  @Post('achievement-definitions')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN)
  createDefinition(@Body() createAchievementDefinitionDto: CreateAchievementDefinitionDto) {
    return this.achievementsService.createDefinition(createAchievementDefinitionDto);
  }

  @Get('achievement-definitions')
  @UseGuards(JwtAuthGuard)
  findAllDefinitions() {
    return this.achievementsService.findAllDefinitions();
  }

  @Get('achievement-definitions/:id')
  @UseGuards(JwtAuthGuard)
  findOneDefinition(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.achievementsService.findOneDefinition(id);
  }

  @Patch('achievement-definitions/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN)
  updateDefinition(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() updateAchievementDefinitionDto: UpdateAchievementDefinitionDto,
  ) {
    return this.achievementsService.updateDefinition(id, updateAchievementDefinitionDto);
  }

  @Delete('achievement-definitions/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN)
  removeDefinition(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.achievementsService.removeDefinition(id);
  }

  @Get('camp-participations/:participationId/achievements')
  @UseGuards(JwtAuthGuard)
  findAchievementsByParticipation(@Param('participationId', new ParseUUIDPipe()) participationId: string) {
    return this.achievementsService.findAchievementsByParticipation(participationId);
  }

  @Post('camp-participations/:participationId/unlock-achievements')
  @UseGuards(JwtAuthGuard)
  unlockParticipationAchievements(
    @Param('participationId', new ParseUUIDPipe()) participationId: string,
  ): Promise<UnlockParticipationAchievementsResultDto> {
    return this.achievementsService.unlockParticipationAchievements(participationId);
  }
}
