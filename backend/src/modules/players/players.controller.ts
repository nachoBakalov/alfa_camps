import {
  Body,
  Controller,
  Delete,
  Get,
  ParseUUIDPipe,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { Roles } from '../../common/decorators/roles.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { UserRole } from '../users/enums/user-role.enum';
import { CreatePlayerDto } from './dto/create-player.dto';
import { QueryPlayersDto } from './dto/query-players.dto';
import { UpdatePlayerDto } from './dto/update-player.dto';
import { PlayersService } from './players.service';

@Controller('players')
export class PlayersController {
  constructor(private readonly playersService: PlayersService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  create(@Body() createPlayerDto: CreatePlayerDto) {
    return this.playersService.create(createPlayerDto);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  findAll(@Query() query: QueryPlayersDto) {
    return this.playersService.findAll(query);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  findOne(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.playersService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  update(@Param('id', new ParseUUIDPipe()) id: string, @Body() updatePlayerDto: UpdatePlayerDto) {
    return this.playersService.update(id, updatePlayerDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN)
  remove(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.playersService.remove(id);
  }
}
