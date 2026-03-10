import { Test, TestingModule } from '@nestjs/testing';
import { AchievementsController } from './achievements.controller';
import { AchievementsService } from './achievements.service';

const createServiceMock = () => ({
  createDefinition: jest.fn(),
  findAllDefinitions: jest.fn(),
  findOneDefinition: jest.fn(),
  updateDefinition: jest.fn(),
  removeDefinition: jest.fn(),
  findAchievementsByParticipation: jest.fn(),
  unlockParticipationAchievements: jest.fn(),
});

describe('AchievementsController', () => {
  let controller: AchievementsController;
  let service: ReturnType<typeof createServiceMock>;

  beforeEach(async () => {
    service = createServiceMock();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AchievementsController],
      providers: [{ provide: AchievementsService, useValue: service }],
    }).compile();

    controller = module.get<AchievementsController>(AchievementsController);
  });

  it('controller is defined', () => {
    expect(controller).toBeDefined();
  });

  it('definition endpoints delegate to service', async () => {
    service.createDefinition.mockResolvedValue({ id: 'a1' });
    service.findAllDefinitions.mockResolvedValue([{ id: 'a1' }]);
    service.findOneDefinition.mockResolvedValue({ id: 'a1' });
    service.updateDefinition.mockResolvedValue({ id: 'a1', threshold: 5 });
    service.removeDefinition.mockResolvedValue(undefined);

    await controller.createDefinition({
      name: 'A',
      conditionType: 'KILLS' as never,
      threshold: 1,
    });
    await controller.findAllDefinitions();
    await controller.findOneDefinition('a1');
    await controller.updateDefinition('a1', { threshold: 5 });
    await controller.removeDefinition('a1');

    expect(service.createDefinition).toHaveBeenCalled();
    expect(service.findAllDefinitions).toHaveBeenCalled();
    expect(service.findOneDefinition).toHaveBeenCalledWith('a1');
    expect(service.updateDefinition).toHaveBeenCalledWith('a1', { threshold: 5 });
    expect(service.removeDefinition).toHaveBeenCalledWith('a1');
  });

  it('unlock-achievements delegates to service', async () => {
    const expected = {
      participationId: 'p1',
      unlockedCount: 1,
      totalEligibleCount: 1,
      unlockedAchievementIds: ['a1'],
    };
    service.unlockParticipationAchievements.mockResolvedValue(expected);

    const result = await controller.unlockParticipationAchievements('p1');

    expect(service.unlockParticipationAchievements).toHaveBeenCalledWith('p1');
    expect(result).toEqual(expected);
  });

  it('get participation achievements delegates to service', async () => {
    const expected = [{ id: 'pa1' }];
    service.findAchievementsByParticipation.mockResolvedValue(expected);

    const result = await controller.findAchievementsByParticipation('p1');

    expect(service.findAchievementsByParticipation).toHaveBeenCalledWith('p1');
    expect(result).toEqual(expected);
  });
});
