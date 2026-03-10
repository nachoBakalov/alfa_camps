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
import { CreateRankCategoryDto } from './dto/create-rank-category.dto';
import { CreateRankDefinitionDto } from './dto/create-rank-definition.dto';
import { RecomputeParticipationRanksResultDto } from './dto/recompute-participation-ranks-result.dto';
import { UpdateRankCategoryDto } from './dto/update-rank-category.dto';
import { UpdateRankDefinitionDto } from './dto/update-rank-definition.dto';
import { RanksService } from './ranks.service';

@Controller()
export class RanksController {
  constructor(private readonly ranksService: RanksService) {}

  @Post('rank-categories')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN)
  createCategory(@Body() createRankCategoryDto: CreateRankCategoryDto) {
    return this.ranksService.createCategory(createRankCategoryDto);
  }

  @Get('rank-categories')
  @UseGuards(JwtAuthGuard)
  findAllCategories() {
    return this.ranksService.findAllCategories();
  }

  @Get('rank-categories/:id')
  @UseGuards(JwtAuthGuard)
  findOneCategory(@Param('id') id: string) {
    return this.ranksService.findOneCategory(id);
  }

  @Patch('rank-categories/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN)
  updateCategory(@Param('id') id: string, @Body() updateRankCategoryDto: UpdateRankCategoryDto) {
    return this.ranksService.updateCategory(id, updateRankCategoryDto);
  }

  @Delete('rank-categories/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN)
  removeCategory(@Param('id') id: string) {
    return this.ranksService.removeCategory(id);
  }

  @Post('rank-definitions')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN)
  createDefinition(@Body() createRankDefinitionDto: CreateRankDefinitionDto) {
    return this.ranksService.createDefinition(createRankDefinitionDto);
  }

  @Get('rank-definitions')
  @UseGuards(JwtAuthGuard)
  findAllDefinitions() {
    return this.ranksService.findAllDefinitions();
  }

  @Get('rank-categories/:categoryId/rank-definitions')
  @UseGuards(JwtAuthGuard)
  findDefinitionsByCategory(@Param('categoryId') categoryId: string) {
    return this.ranksService.findDefinitionsByCategory(categoryId);
  }

  @Get('rank-definitions/:id')
  @UseGuards(JwtAuthGuard)
  findOneDefinition(@Param('id') id: string) {
    return this.ranksService.findOneDefinition(id);
  }

  @Patch('rank-definitions/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN)
  updateDefinition(
    @Param('id') id: string,
    @Body() updateRankDefinitionDto: UpdateRankDefinitionDto,
  ) {
    return this.ranksService.updateDefinition(id, updateRankDefinitionDto);
  }

  @Delete('rank-definitions/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN)
  removeDefinition(@Param('id') id: string) {
    return this.ranksService.removeDefinition(id);
  }

  @Post('camp-participations/:participationId/recompute-ranks')
  @UseGuards(JwtAuthGuard)
  recomputeParticipationRanks(
    @Param('participationId') participationId: string,
  ): Promise<RecomputeParticipationRanksResultDto> {
    return this.ranksService.recomputeParticipationRanks(participationId);
  }
}
