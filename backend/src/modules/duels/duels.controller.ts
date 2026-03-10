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
import { CreateDuelDto } from './dto/create-duel.dto';
import { UpdateDuelDto } from './dto/update-duel.dto';
import { DuelsService } from './duels.service';

@Controller()
export class DuelsController {
  constructor(private readonly duelsService: DuelsService) {}

  @Post('duels')
  @UseGuards(JwtAuthGuard)
  create(@Body() createDuelDto: CreateDuelDto) {
    return this.duelsService.create(createDuelDto);
  }

  @Get('duels')
  @UseGuards(JwtAuthGuard)
  findAll() {
    return this.duelsService.findAll();
  }

  @Get('duels/:id')
  @UseGuards(JwtAuthGuard)
  findOne(@Param('id') id: string) {
    return this.duelsService.findOne(id);
  }

  @Patch('duels/:id')
  @UseGuards(JwtAuthGuard)
  update(@Param('id') id: string, @Body() updateDuelDto: UpdateDuelDto) {
    return this.duelsService.update(id, updateDuelDto);
  }

  @Delete('duels/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN)
  remove(@Param('id') id: string) {
    return this.duelsService.remove(id);
  }

  @Get('battles/:battleId/duels')
  @UseGuards(JwtAuthGuard)
  findByBattle(@Param('battleId') battleId: string) {
    return this.duelsService.findByBattle(battleId);
  }

  @Get('camp-participations/:participationId/duels')
  @UseGuards(JwtAuthGuard)
  findByParticipation(@Param('participationId') participationId: string) {
    return this.duelsService.findByParticipation(participationId);
  }
}
