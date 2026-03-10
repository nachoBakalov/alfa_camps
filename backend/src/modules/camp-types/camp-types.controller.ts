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
import { CampTypesService } from './camp-types.service';
import { CreateCampTypeDto } from './dto/create-camp-type.dto';
import { UpdateCampTypeDto } from './dto/update-camp-type.dto';

@Controller('camp-types')
export class CampTypesController {
  constructor(private readonly campTypesService: CampTypesService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN)
  create(@Body() createCampTypeDto: CreateCampTypeDto) {
    return this.campTypesService.create(createCampTypeDto);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  findAll() {
    return this.campTypesService.findAll();
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  findOne(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.campTypesService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN)
  update(@Param('id', new ParseUUIDPipe()) id: string, @Body() updateCampTypeDto: UpdateCampTypeDto) {
    return this.campTypesService.update(id, updateCampTypeDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN)
  remove(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.campTypesService.remove(id);
  }
}
