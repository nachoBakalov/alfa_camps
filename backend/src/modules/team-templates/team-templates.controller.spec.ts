import { Test, TestingModule } from '@nestjs/testing';
import { TeamTemplatesController } from './team-templates.controller';
import { TeamTemplatesService } from './team-templates.service';

const createServiceMock = () => ({
  create: jest.fn(),
  findAll: jest.fn(),
  findOne: jest.fn(),
  update: jest.fn(),
  remove: jest.fn(),
  findByCampType: jest.fn(),
});

describe('TeamTemplatesController', () => {
  let controller: TeamTemplatesController;
  let service: ReturnType<typeof createServiceMock>;

  beforeEach(async () => {
    service = createServiceMock();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [TeamTemplatesController],
      providers: [
        {
          provide: TeamTemplatesService,
          useValue: service,
        },
      ],
    }).compile();

    controller = module.get<TeamTemplatesController>(TeamTemplatesController);
  });

  it('controller is defined', () => {
    expect(controller).toBeDefined();
  });

  it('create delegates to service', async () => {
    const dto = {
      campTypeId: '8ef7685b-6c18-4e88-94a4-f807f987bf58',
      name: 'Lions',
      color: 'red',
      logoUrl: '/logo.png',
      sortOrder: 1,
    };
    const expected = { id: 'team-template-id', ...dto };
    service.create.mockResolvedValue(expected);

    const result = await controller.create(dto);

    expect(service.create).toHaveBeenCalledWith(dto);
    expect(result).toEqual(expected);
  });

  it('findAll delegates to service', async () => {
    const expected = [{ id: 'tt-1' }, { id: 'tt-2' }];
    service.findAll.mockResolvedValue(expected);

    const result = await controller.findAll();

    expect(service.findAll).toHaveBeenCalled();
    expect(result).toEqual(expected);
  });

  it('findOne delegates to service', async () => {
    const expected = { id: 'team-template-id' };
    service.findOne.mockResolvedValue(expected);

    const result = await controller.findOne('team-template-id');

    expect(service.findOne).toHaveBeenCalledWith('team-template-id');
    expect(result).toEqual(expected);
  });

  it('update delegates to service', async () => {
    const dto = { name: 'Updated Lions' };
    const expected = { id: 'team-template-id', ...dto };
    service.update.mockResolvedValue(expected);

    const result = await controller.update('team-template-id', dto);

    expect(service.update).toHaveBeenCalledWith('team-template-id', dto);
    expect(result).toEqual(expected);
  });

  it('remove delegates to service', async () => {
    service.remove.mockResolvedValue(undefined);

    const result = await controller.remove('team-template-id');

    expect(service.remove).toHaveBeenCalledWith('team-template-id');
    expect(result).toBeUndefined();
  });

  it('findByCampType delegates to service', async () => {
    const expected = [{ id: 'team-template-id' }];
    service.findByCampType.mockResolvedValue(expected);

    const result = await controller.findByCampType('8ef7685b-6c18-4e88-94a4-f807f987bf58');

    expect(service.findByCampType).toHaveBeenCalledWith(
      '8ef7685b-6c18-4e88-94a4-f807f987bf58',
    );
    expect(result).toEqual(expected);
  });
});
