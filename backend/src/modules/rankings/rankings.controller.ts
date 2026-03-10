import { Controller, Get, Param, ParseUUIDPipe, Query } from '@nestjs/common';
import { QueryRankingLimitDto } from './dto/query-ranking-limit.dto';
import { RankingsService } from './rankings.service';

@Controller()
export class RankingsController {
  constructor(private readonly rankingsService: RankingsService) {}

  @Get('camps/:campId/rankings/points')
  getCampPointsRanking(@Param('campId', new ParseUUIDPipe()) campId: string, @Query() query: QueryRankingLimitDto) {
    return this.rankingsService.getCampPointsRanking(campId, query.limit);
  }

  @Get('camps/:campId/rankings/kills')
  getCampKillsRanking(@Param('campId', new ParseUUIDPipe()) campId: string, @Query() query: QueryRankingLimitDto) {
    return this.rankingsService.getCampKillsRanking(campId, query.limit);
  }

  @Get('camps/:campId/rankings/survivals')
  getCampSurvivalsRanking(@Param('campId', new ParseUUIDPipe()) campId: string, @Query() query: QueryRankingLimitDto) {
    return this.rankingsService.getCampSurvivalsRanking(campId, query.limit);
  }

  @Get('camps/:campId/team-standings')
  getCampTeamStandings(@Param('campId', new ParseUUIDPipe()) campId: string) {
    return this.rankingsService.getCampTeamStandings(campId);
  }
}
