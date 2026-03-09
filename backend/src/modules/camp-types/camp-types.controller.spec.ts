import { Test, TestingModule } from '@nestjs/testing';
import { CampTypesController } from './camp-types.controller';
import { CampTypesService } from './camp-types.service';

const createServiceMock = () => ({
  create: jest.fn(),
  findAll: jest.fn(),
  findOne: jest.fn(),
  update: jest.fn(),
  remove: jest.fn(),
});

describe('CampTypesController', () => {
  let controller: CampTypesController;
  let service: ReturnType<typeof createServiceMock>;

  beforeEach(async () => {
    service = createServiceMock();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [CampTypesController],
      providers: [
        {
          provide: CampTypesService,
          useValue: service,
        },
      ],
    }).compile();

    controller = module.get<CampTypesController>(CampTypesController);
  });

  it('controller is defined', () => {
    expect(controller).toBeDefined();
  });

  it('create() delegates to service', async () => {
    const dto = {
      name: 'Camp Type',
      slug: 'camp-type',
      description: 'Description',
      logoUrl: '/logo.png',
      coverImageUrl: '/cover.jpg',
    };
    const expected = { id: 'id', ...dto };
    service.create.mockResolvedValue(expected);

    const result = await controller.create(dto);

    expect(service.create).toHaveBeenCalledWith(dto);
    expect(result).toEqual(expected);
  });

  it('findAll() delegates to service', async () => {
    const expected = [{ id: 'id-1' }, { id: 'id-2' }];
    service.findAll.mockResolvedValue(expected);

    const result = await controller.findAll();

    expect(service.findAll).toHaveBeenCalled();
    expect(result).toEqual(expected);
  });

  it('findOne() delegates to service', async () => {
    const expected = { id: 'camp-type-id' };
    service.findOne.mockResolvedValue(expected);

    const result = await controller.findOne('camp-type-id');

    expect(service.findOne).toHaveBeenCalledWith('camp-type-id');
    expect(result).toEqual(expected);
  });

  it('update() delegates to service', async () => {
    const dto = { name: 'Updated Name' };
    const expected = { id: 'camp-type-id', ...dto };
    service.update.mockResolvedValue(expected);

    const result = await controller.update('camp-type-id', dto);

    expect(service.update).toHaveBeenCalledWith('camp-type-id', dto);
    expect(result).toEqual(expected);
  });

  it('remove() delegates to service', async () => {
    service.remove.mockResolvedValue(undefined);

    const result = await controller.remove('camp-type-id');

    expect(service.remove).toHaveBeenCalledWith('camp-type-id');
    expect(result).toBeUndefined();
  });
});
