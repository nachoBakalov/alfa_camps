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
import { BattlePlayerResultsService } from './battle-player-results.service';
import { CreateBattlePlayerResultDto } from './dto/create-battle-player-result.dto';
import { UpdateBattlePlayerResultDto } from './dto/update-battle-player-result.dto';

@Controller()
export class BattlePlayerResultsController {
  constructor(
    private readonly battlePlayerResultsService: BattlePlayerResultsService,
  ) {}

  @Post('battle-player-results')
  @UseGuards(JwtAuthGuard)
  create(@Body() createBattlePlayerResultDto: CreateBattlePlayerResultDto) {
    return this.battlePlayerResultsService.create(createBattlePlayerResultDto);
  }

  @Get('battle-player-results')
  @UseGuards(JwtAuthGuard)
  findAll() {
    return this.battlePlayerResultsService.findAll();
  }

  @Get('battle-player-results/:id')
  @UseGuards(JwtAuthGuard)
  findOne(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.battlePlayerResultsService.findOne(id);
  }

  @Patch('battle-player-results/:id')
  @UseGuards(JwtAuthGuard)
  update(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() updateBattlePlayerResultDto: UpdateBattlePlayerResultDto,
  ) {
    return this.battlePlayerResultsService.update(id, updateBattlePlayerResultDto);
  }

  @Delete('battle-player-results/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN)
  remove(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.battlePlayerResultsService.remove(id);
  }

  @Get('battles/:battleId/player-results')
  @UseGuards(JwtAuthGuard)
  findByBattle(@Param('battleId', new ParseUUIDPipe()) battleId: string) {
    return this.battlePlayerResultsService.findByBattle(battleId);
  }

  @Get('camp-participations/:participationId/battle-results')
  @UseGuards(JwtAuthGuard)
  findByParticipation(@Param('participationId', new ParseUUIDPipe()) participationId: string) {
    return this.battlePlayerResultsService.findByParticipation(participationId);
  }
}
