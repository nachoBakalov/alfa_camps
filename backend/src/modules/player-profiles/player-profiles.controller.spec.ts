import { Test, TestingModule } from '@nestjs/testing';
import { PlayerProfilesController } from './player-profiles.controller';
import { PlayerProfilesService } from './player-profiles.service';

const createServiceMock = () => ({
  getPlayerProfile: jest.fn(),
});

describe('PlayerProfilesController', () => {
  let controller: PlayerProfilesController;
  let service: ReturnType<typeof createServiceMock>;

  beforeEach(async () => {
    service = createServiceMock();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [PlayerProfilesController],
      providers: [{ provide: PlayerProfilesService, useValue: service }],
    }).compile();

    controller = module.get<PlayerProfilesController>(PlayerProfilesController);
  });

  it('controller is defined', () => {
    expect(controller).toBeDefined();
  });

  it('getPlayerProfile delegates to service', async () => {
    service.getPlayerProfile.mockResolvedValue({ playerId: 'player-1' });

    const result = await controller.getPlayerProfile('player-1');

    expect(service.getPlayerProfile).toHaveBeenCalledWith('player-1');
    expect(result).toEqual({ playerId: 'player-1' });
  });
});
