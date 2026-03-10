import { Test, TestingModule } from '@nestjs/testing';
import { BattlesController } from './battles.controller';
import { BattlesService } from './battles.service';
import { BattleType } from './enums/battle-type.enum';

const createServiceMock = () => ({
  create: jest.fn(),
  findAll: jest.fn(),
  findOne: jest.fn(),
  update: jest.fn(),
  remove: jest.fn(),
  findByCamp: jest.fn(),
});

describe('BattlesController', () => {
  let controller: BattlesController;
  let service: ReturnType<typeof createServiceMock>;

  beforeEach(async () => {
    service = createServiceMock();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [BattlesController],
      providers: [
        {
          provide: BattlesService,
          useValue: service,
        },
      ],
    }).compile();

    controller = module.get<BattlesController>(BattlesController);
  });

  it('controller is defined', () => {
    expect(controller).toBeDefined();
  });

  it('create delegates to service', async () => {
    const dto = {
      campId: 'camp-id',
      title: 'Final Battle',
      battleType: BattleType.MASS_BATTLE,
      battleDate: '2026-07-03',
    };
    const request = {
      user: {
        sub: 'user-id',
      },
    };
    const expected = { id: 'battle-id', ...dto, createdBy: 'user-id' };
    service.create.mockResolvedValue(expected);

    const result = await controller.create(dto, request);

    expect(service.create).toHaveBeenCalledWith(dto, 'user-id');
    expect(result).toEqual(expected);
  });

  it('findAll delegates to service', async () => {
    const expected = [{ id: 'battle-1' }, { id: 'battle-2' }];
    service.findAll.mockResolvedValue(expected);

    const result = await controller.findAll();

    expect(service.findAll).toHaveBeenCalled();
    expect(result).toEqual(expected);
  });

  it('findOne delegates to service', async () => {
    const expected = { id: 'battle-id' };
    service.findOne.mockResolvedValue(expected);

    const result = await controller.findOne('battle-id');

    expect(service.findOne).toHaveBeenCalledWith('battle-id');
    expect(result).toEqual(expected);
  });

  it('update delegates to service', async () => {
    const dto = { title: 'Updated battle' };
    const expected = { id: 'battle-id', ...dto };
    service.update.mockResolvedValue(expected);

    const result = await controller.update('battle-id', dto);

    expect(service.update).toHaveBeenCalledWith('battle-id', dto);
    expect(result).toEqual(expected);
  });

  it('remove delegates to service', async () => {
    service.remove.mockResolvedValue(undefined);

    const result = await controller.remove('battle-id');

    expect(service.remove).toHaveBeenCalledWith('battle-id');
    expect(result).toBeUndefined();
  });

  it('findByCamp delegates to service', async () => {
    const expected = [{ id: 'battle-id' }];
    service.findByCamp.mockResolvedValue(expected);

    const result = await controller.findByCamp('camp-id');

    expect(service.findByCamp).toHaveBeenCalledWith('camp-id');
    expect(result).toEqual(expected);
  });
});
