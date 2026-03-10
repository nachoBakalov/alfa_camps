import { Test, TestingModule } from '@nestjs/testing';
import { MedalType } from './enums/medal-type.enum';
import { MedalsController } from './medals.controller';
import { MedalsService } from './medals.service';

const createServiceMock = () => ({
  createDefinition: jest.fn(),
  findAllDefinitions: jest.fn(),
  findOneDefinition: jest.fn(),
  updateDefinition: jest.fn(),
  removeDefinition: jest.fn(),
  findMedalsByParticipation: jest.fn(),
  awardMedal: jest.fn(),
  removeAward: jest.fn(),
});

describe('MedalsController', () => {
  let controller: MedalsController;
  let service: ReturnType<typeof createServiceMock>;

  beforeEach(async () => {
    service = createServiceMock();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [MedalsController],
      providers: [{ provide: MedalsService, useValue: service }],
    }).compile();

    controller = module.get<MedalsController>(MedalsController);
  });

  it('controller is defined', () => {
    expect(controller).toBeDefined();
  });

  it('definition endpoints delegate to service', async () => {
    service.createDefinition.mockResolvedValue({ id: 'm1' });
    service.findAllDefinitions.mockResolvedValue([{ id: 'm1' }]);
    service.findOneDefinition.mockResolvedValue({ id: 'm1' });
    service.updateDefinition.mockResolvedValue({ id: 'm1', name: 'Best MVP' });
    service.removeDefinition.mockResolvedValue(undefined);

    await controller.createDefinition({ name: 'MVP', type: MedalType.MANUAL });
    await controller.findAllDefinitions();
    await controller.findOneDefinition('m1');
    await controller.updateDefinition('m1', { name: 'Best MVP' });
    await controller.removeDefinition('m1');

    expect(service.createDefinition).toHaveBeenCalled();
    expect(service.findAllDefinitions).toHaveBeenCalled();
    expect(service.findOneDefinition).toHaveBeenCalledWith('m1');
    expect(service.updateDefinition).toHaveBeenCalledWith('m1', { name: 'Best MVP' });
    expect(service.removeDefinition).toHaveBeenCalledWith('m1');
  });

  it('participation medals endpoint delegates to service', async () => {
    service.findMedalsByParticipation.mockResolvedValue([{ id: 'pm1' }]);

    const result = await controller.findMedalsByParticipation('p1');

    expect(service.findMedalsByParticipation).toHaveBeenCalledWith('p1');
    expect(result).toEqual([{ id: 'pm1' }]);
  });

  it('award medal delegates to service', async () => {
    const expected = { id: 'pm1' };
    service.awardMedal.mockResolvedValue(expected);

    const result = await controller.awardMedal(
      { participationId: 'p1', medalId: 'm1' },
      { user: { sub: 'u1' } },
    );

    expect(service.awardMedal).toHaveBeenCalledWith({ participationId: 'p1', medalId: 'm1' }, 'u1');
    expect(result).toEqual(expected);
  });

  it('remove player medal delegates to service', async () => {
    service.removeAward.mockResolvedValue(undefined);

    await controller.removeAward('pm1');

    expect(service.removeAward).toHaveBeenCalledWith('pm1');
  });
});
