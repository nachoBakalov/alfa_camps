import { Test, TestingModule } from '@nestjs/testing';
import { RankingsController } from './rankings.controller';
import { RankingsService } from './rankings.service';

const createServiceMock = () => ({
  getCampPointsRanking: jest.fn(),
  getCampKillsRanking: jest.fn(),
  getCampSurvivalsRanking: jest.fn(),
  getCampTeamStandings: jest.fn(),
});

describe('RankingsController', () => {
  let controller: RankingsController;
  let service: ReturnType<typeof createServiceMock>;

  beforeEach(async () => {
    service = createServiceMock();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [RankingsController],
      providers: [{ provide: RankingsService, useValue: service }],
    }).compile();

    controller = module.get<RankingsController>(RankingsController);
  });

  it('controller is defined', () => {
    expect(controller).toBeDefined();
  });

  it('points ranking delegates to service', async () => {
    service.getCampPointsRanking.mockResolvedValue([{ participationId: 'p1' }]);

    const result = await controller.getCampPointsRanking('camp-1', { limit: 10 });

    expect(service.getCampPointsRanking).toHaveBeenCalledWith('camp-1', 10);
    expect(result).toEqual([{ participationId: 'p1' }]);
  });

  it('kills ranking delegates to service', async () => {
    service.getCampKillsRanking.mockResolvedValue([{ participationId: 'p1' }]);

    const result = await controller.getCampKillsRanking('camp-1', { limit: 20 });

    expect(service.getCampKillsRanking).toHaveBeenCalledWith('camp-1', 20);
    expect(result).toEqual([{ participationId: 'p1' }]);
  });

  it('survivals ranking delegates to service', async () => {
    service.getCampSurvivalsRanking.mockResolvedValue([{ participationId: 'p1' }]);

    const result = await controller.getCampSurvivalsRanking('camp-1', { limit: 30 });

    expect(service.getCampSurvivalsRanking).toHaveBeenCalledWith('camp-1', 30);
    expect(result).toEqual([{ participationId: 'p1' }]);
  });

  it('team standings delegates to service', async () => {
    service.getCampTeamStandings.mockResolvedValue([{ teamId: 't1' }]);

    const result = await controller.getCampTeamStandings('camp-1');

    expect(service.getCampTeamStandings).toHaveBeenCalledWith('camp-1');
    expect(result).toEqual([{ teamId: 't1' }]);
  });
});
