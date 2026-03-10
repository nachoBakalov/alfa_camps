import { Test, TestingModule } from '@nestjs/testing';
import { RanksController } from './ranks.controller';
import { RanksService } from './ranks.service';

const createServiceMock = () => ({
  createCategory: jest.fn(),
  findAllCategories: jest.fn(),
  findOneCategory: jest.fn(),
  updateCategory: jest.fn(),
  removeCategory: jest.fn(),
  createDefinition: jest.fn(),
  findAllDefinitions: jest.fn(),
  findDefinitionsByCategory: jest.fn(),
  findOneDefinition: jest.fn(),
  updateDefinition: jest.fn(),
  removeDefinition: jest.fn(),
  recomputeParticipationRanks: jest.fn(),
});

describe('RanksController', () => {
  let controller: RanksController;
  let service: ReturnType<typeof createServiceMock>;

  beforeEach(async () => {
    service = createServiceMock();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [RanksController],
      providers: [{ provide: RanksService, useValue: service }],
    }).compile();

    controller = module.get<RanksController>(RanksController);
  });

  it('controller is defined', () => {
    expect(controller).toBeDefined();
  });

  it('category endpoints delegate to service', async () => {
    service.createCategory.mockResolvedValue({ id: '1' });
    service.findAllCategories.mockResolvedValue([{ id: '1' }]);
    service.findOneCategory.mockResolvedValue({ id: '1' });
    service.updateCategory.mockResolvedValue({ id: '1', name: 'Updated' });
    service.removeCategory.mockResolvedValue(undefined);

    await controller.createCategory({ code: 'KILLS_RANK', name: 'Kills' });
    await controller.findAllCategories();
    await controller.findOneCategory('1');
    await controller.updateCategory('1', { name: 'Updated' });
    await controller.removeCategory('1');

    expect(service.createCategory).toHaveBeenCalled();
    expect(service.findAllCategories).toHaveBeenCalled();
    expect(service.findOneCategory).toHaveBeenCalledWith('1');
    expect(service.updateCategory).toHaveBeenCalledWith('1', { name: 'Updated' });
    expect(service.removeCategory).toHaveBeenCalledWith('1');
  });

  it('definition endpoints delegate to service', async () => {
    service.createDefinition.mockResolvedValue({ id: 'd1' });
    service.findAllDefinitions.mockResolvedValue([{ id: 'd1' }]);
    service.findDefinitionsByCategory.mockResolvedValue([{ id: 'd1' }]);
    service.findOneDefinition.mockResolvedValue({ id: 'd1' });
    service.updateDefinition.mockResolvedValue({ id: 'd1', threshold: 10 });
    service.removeDefinition.mockResolvedValue(undefined);

    await controller.createDefinition({ categoryId: 'c1', threshold: 1, rankOrder: 1 });
    await controller.findAllDefinitions();
    await controller.findDefinitionsByCategory('c1');
    await controller.findOneDefinition('d1');
    await controller.updateDefinition('d1', { threshold: 10 });
    await controller.removeDefinition('d1');

    expect(service.createDefinition).toHaveBeenCalled();
    expect(service.findAllDefinitions).toHaveBeenCalled();
    expect(service.findDefinitionsByCategory).toHaveBeenCalledWith('c1');
    expect(service.findOneDefinition).toHaveBeenCalledWith('d1');
    expect(service.updateDefinition).toHaveBeenCalledWith('d1', { threshold: 10 });
    expect(service.removeDefinition).toHaveBeenCalledWith('d1');
  });

  it('recompute-ranks delegates to service', async () => {
    const expected = {
      participationId: 'p1',
      updatedRanks: [{ categoryCode: 'KILLS_RANK', rankDefinitionId: 'rd1' }],
      unchangedRanksCount: 0,
      createdRanksCount: 1,
    };
    service.recomputeParticipationRanks.mockResolvedValue(expected);

    const result = await controller.recomputeParticipationRanks('p1');

    expect(service.recomputeParticipationRanks).toHaveBeenCalledWith('p1');
    expect(result).toEqual(expected);
  });
});
