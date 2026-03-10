import { Test, TestingModule } from '@nestjs/testing';
import { CampParticipationsController } from './camp-participations.controller';
import { CampParticipationsService } from './camp-participations.service';

const createServiceMock = () => ({
  create: jest.fn(),
  findAll: jest.fn(),
  findOne: jest.fn(),
  update: jest.fn(),
  remove: jest.fn(),
  findByCamp: jest.fn(),
  findByPlayer: jest.fn(),
});

describe('CampParticipationsController', () => {
  let controller: CampParticipationsController;
  let service: ReturnType<typeof createServiceMock>;

  beforeEach(async () => {
    service = createServiceMock();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [CampParticipationsController],
      providers: [
        {
          provide: CampParticipationsService,
          useValue: service,
        },
      ],
    }).compile();

    controller = module.get<CampParticipationsController>(CampParticipationsController);
  });

  it('controller is defined', () => {
    expect(controller).toBeDefined();
  });

  it('create delegates to service', async () => {
    const dto = {
      campId: 'camp-id',
      playerId: 'player-id',
    };
    const expected = { id: 'participation-id', ...dto };
    service.create.mockResolvedValue(expected);

    const result = await controller.create(dto);

    expect(service.create).toHaveBeenCalledWith(dto);
    expect(result).toEqual(expected);
  });

  it('findAll delegates to service', async () => {
    const expected = [{ id: 'p1' }, { id: 'p2' }];
    service.findAll.mockResolvedValue(expected);

    const result = await controller.findAll();

    expect(service.findAll).toHaveBeenCalled();
    expect(result).toEqual(expected);
  });

  it('findOne delegates to service', async () => {
    const expected = { id: 'participation-id' };
    service.findOne.mockResolvedValue(expected);

    const result = await controller.findOne('participation-id');

    expect(service.findOne).toHaveBeenCalledWith('participation-id');
    expect(result).toEqual(expected);
  });

  it('update delegates to service', async () => {
    const dto = { kills: 2, points: 10 };
    const expected = { id: 'participation-id', ...dto };
    service.update.mockResolvedValue(expected);

    const result = await controller.update('participation-id', dto);

    expect(service.update).toHaveBeenCalledWith('participation-id', dto);
    expect(result).toEqual(expected);
  });

  it('remove delegates to service', async () => {
    service.remove.mockResolvedValue(undefined);

    const result = await controller.remove('participation-id');

    expect(service.remove).toHaveBeenCalledWith('participation-id');
    expect(result).toBeUndefined();
  });

  it('findByCamp delegates to service', async () => {
    const expected = [{ id: 'participation-id' }];
    service.findByCamp.mockResolvedValue(expected);

    const result = await controller.findByCamp('camp-id');

    expect(service.findByCamp).toHaveBeenCalledWith('camp-id');
    expect(result).toEqual(expected);
  });

  it('findByPlayer delegates to service', async () => {
    const expected = [{ id: 'participation-id' }];
    service.findByPlayer.mockResolvedValue(expected);

    const result = await controller.findByPlayer('player-id');

    expect(service.findByPlayer).toHaveBeenCalledWith('player-id');
    expect(result).toEqual(expected);
  });
});
