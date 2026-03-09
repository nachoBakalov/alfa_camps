import { Test, TestingModule } from '@nestjs/testing';
import { CampsController } from './camps.controller';
import { CampsService } from './camps.service';

const createServiceMock = () => ({
  create: jest.fn(),
  findAll: jest.fn(),
  findOne: jest.fn(),
  update: jest.fn(),
  remove: jest.fn(),
});

describe('CampsController', () => {
  let controller: CampsController;
  let service: ReturnType<typeof createServiceMock>;

  beforeEach(async () => {
    service = createServiceMock();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [CampsController],
      providers: [
        {
          provide: CampsService,
          useValue: service,
        },
      ],
    }).compile();

    controller = module.get<CampsController>(CampsController);
  });

  it('controller is defined', () => {
    expect(controller).toBeDefined();
  });

  it('create delegates to service', async () => {
    const dto = {
      campTypeId: '8ef7685b-6c18-4e88-94a4-f807f987bf58',
      title: 'Summer Camp',
      year: 2026,
      startDate: '2026-07-01',
      endDate: '2026-07-10',
      location: 'Sofia',
      description: 'Camp description',
      logoUrl: '/logo.png',
      coverImageUrl: '/cover.jpg',
    };

    const request = {
      user: {
        sub: 'user-id',
      },
    };

    const expected = { id: 'camp-id', ...dto, createdBy: 'user-id' };
    service.create.mockResolvedValue(expected);

    const result = await controller.create(dto, request);

    expect(service.create).toHaveBeenCalledWith(dto, 'user-id');
    expect(result).toEqual(expected);
  });

  it('findAll delegates to service', async () => {
    const expected = [{ id: 'camp-1' }, { id: 'camp-2' }];
    service.findAll.mockResolvedValue(expected);

    const result = await controller.findAll();

    expect(service.findAll).toHaveBeenCalled();
    expect(result).toEqual(expected);
  });

  it('findOne delegates to service', async () => {
    const expected = { id: 'camp-id' };
    service.findOne.mockResolvedValue(expected);

    const result = await controller.findOne('camp-id');

    expect(service.findOne).toHaveBeenCalledWith('camp-id');
    expect(result).toEqual(expected);
  });

  it('update delegates to service', async () => {
    const dto = { title: 'Updated Camp' };
    const expected = { id: 'camp-id', ...dto };
    service.update.mockResolvedValue(expected);

    const result = await controller.update('camp-id', dto);

    expect(service.update).toHaveBeenCalledWith('camp-id', dto);
    expect(result).toEqual(expected);
  });

  it('remove delegates to service', async () => {
    service.remove.mockResolvedValue(undefined);

    const result = await controller.remove('camp-id');

    expect(service.remove).toHaveBeenCalledWith('camp-id');
    expect(result).toBeUndefined();
  });
});
