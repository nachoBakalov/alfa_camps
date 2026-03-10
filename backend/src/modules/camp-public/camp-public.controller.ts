import { Controller, Get, Param, ParseUUIDPipe } from '@nestjs/common';
import { CampPublicService } from './camp-public.service';

@Controller('camps/:campId/public')
export class CampPublicController {
  constructor(private readonly campPublicService: CampPublicService) {}

  @Get()
  getCampPublicDetails(@Param('campId', new ParseUUIDPipe()) campId: string) {
    return this.campPublicService.getCampPublicDetails(campId);
  }

  @Get('teams')
  getCampPublicTeams(@Param('campId', new ParseUUIDPipe()) campId: string) {
    return this.campPublicService.getCampPublicTeams(campId);
  }

  @Get('participants')
  getCampPublicParticipants(@Param('campId', new ParseUUIDPipe()) campId: string) {
    return this.campPublicService.getCampPublicParticipants(campId);
  }
}
