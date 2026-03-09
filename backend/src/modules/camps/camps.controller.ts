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
import { CampsService } from './camps.service';
import { CreateCampDto } from './dto/create-camp.dto';
import { UpdateCampDto } from './dto/update-camp.dto';

type RequestUser = {
  sub?: string;
  id?: string;
};

type RequestWithUser = {
  user?: RequestUser;
};

@Controller('camps')
export class CampsController {
  constructor(private readonly campsService: CampsService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  create(@Body() createCampDto: CreateCampDto, @Req() request: RequestWithUser) {
    const createdBy = request.user?.sub ?? request.user?.id ?? null;
    return this.campsService.create(createCampDto, createdBy);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  findAll() {
    return this.campsService.findAll();
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  findOne(@Param('id') id: string) {
    return this.campsService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  update(@Param('id') id: string, @Body() updateCampDto: UpdateCampDto) {
    return this.campsService.update(id, updateCampDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN)
  remove(@Param('id') id: string) {
    return this.campsService.remove(id);
  }
}
