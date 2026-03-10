import {
  Body,
  Controller,
  Delete,
  Get,
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
import { BattlesService } from './battles.service';
import { CreateBattleDto } from './dto/create-battle.dto';
import { UpdateBattleDto } from './dto/update-battle.dto';

type RequestUser = {
  sub?: string;
  id?: string;
};

type RequestWithUser = {
  user?: RequestUser;
};

@Controller()
export class BattlesController {
  constructor(private readonly battlesService: BattlesService) {}

  @Post('battles')
  @UseGuards(JwtAuthGuard)
  create(@Body() createBattleDto: CreateBattleDto, @Req() request: RequestWithUser) {
    const createdBy = request.user?.sub ?? request.user?.id ?? null;
    return this.battlesService.create(createBattleDto, createdBy);
  }

  @Get('battles')
  @UseGuards(JwtAuthGuard)
  findAll() {
    return this.battlesService.findAll();
  }

  @Get('battles/:id')
  @UseGuards(JwtAuthGuard)
  findOne(@Param('id') id: string) {
    return this.battlesService.findOne(id);
  }

  @Patch('battles/:id')
  @UseGuards(JwtAuthGuard)
  update(@Param('id') id: string, @Body() updateBattleDto: UpdateBattleDto) {
    return this.battlesService.update(id, updateBattleDto);
  }

  @Delete('battles/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN)
  remove(@Param('id') id: string) {
    return this.battlesService.remove(id);
  }

  @Get('camps/:campId/battles')
  @UseGuards(JwtAuthGuard)
  findByCamp(@Param('campId') campId: string) {
    return this.battlesService.findByCamp(campId);
  }
}
