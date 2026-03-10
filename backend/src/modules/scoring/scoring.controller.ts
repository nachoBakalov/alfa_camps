import { Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { ApplyBattleScoreResultDto } from './dto/apply-battle-score-result.dto';
import { BattleScorePreviewDto } from './dto/battle-score-preview.dto';
import { FinalizeCampScoreResultDto } from './dto/finalize-camp-score-result.dto';
import { ScoringService } from './scoring.service';

@Controller()
export class ScoringController {
  constructor(private readonly scoringService: ScoringService) {}

  @Get('battles/:battleId/score-preview')
  @UseGuards(JwtAuthGuard)
  previewBattleScore(@Param('battleId') battleId: string): Promise<BattleScorePreviewDto> {
    return this.scoringService.previewBattleScore(battleId);
  }

  @Post('battles/:battleId/apply-score')
  @UseGuards(JwtAuthGuard)
  applyBattleScore(@Param('battleId') battleId: string): Promise<ApplyBattleScoreResultDto> {
    return this.scoringService.applyBattleScore(battleId);
  }

  @Post('camps/:campId/finalize-score')
  @UseGuards(JwtAuthGuard)
  finalizeCampScore(@Param('campId') campId: string): Promise<FinalizeCampScoreResultDto> {
    return this.scoringService.finalizeCampScore(campId);
  }
}
