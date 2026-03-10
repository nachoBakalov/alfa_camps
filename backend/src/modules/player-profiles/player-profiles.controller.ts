import { Controller, Get, Param, ParseUUIDPipe } from '@nestjs/common';
import { PlayerProfilesService } from './player-profiles.service';

@Controller('players')
export class PlayerProfilesController {
  constructor(private readonly playerProfilesService: PlayerProfilesService) {}

  @Get(':playerId/profile')
  getPlayerProfile(@Param('playerId', new ParseUUIDPipe()) playerId: string) {
    return this.playerProfilesService.getPlayerProfile(playerId);
  }
}
