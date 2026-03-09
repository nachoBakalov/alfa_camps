import { Test, TestingModule } from '@nestjs/testing';
import { CampTeamsController } from './camp-teams.controller';
import { CampTeamsService } from './camp-teams.service';

const createServiceMock = () => ({
  create: jest.fn(),
  findAll: jest.fn(),
  findOne: jest.fn(),
  findByCamp: jest.fn(),
  update: jest.fn(),
  remove: jest.fn(),
  cloneFromCampTypeTemplates: jest.fn(),
});

describe('CampTeamsController', () => {
  let controller: CampTeamsController;
  let service: ReturnType<typeof createServiceMock>;

  beforeEach(async () => {
    service = createServiceMock();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [CampTeamsController],
      providers: [
        {
          provide: CampTeamsService,
          useValue: service,
        },
      ],
    }).compile();

    controller = module.get<CampTeamsController>(CampTeamsController);
  });

  it('controller is defined', () => {
    expect(controller).toBeDefined();
  });

  it('create delegates to service', async () => {
    const dto = {
      campId: 'camp-id',
      name: 'Lions',
      color: 'red',
      logoUrl: '/logo.png',
      finalPosition: 1,
      isActive: true,
    };
    const expected = { id: 'team-id', ...dto, teamPoints: 0 };
    service.create.mockResolvedValue(expected);

    const result = await controller.create(dto);

    expect(service.create).toHaveBeenCalledWith(dto);
    expect(result).toEqual(expected);
  });

  it('findAll delegates to service', async () => {
    const expected = [{ id: 't1' }, { id: 't2' }];
    service.findAll.mockResolvedValue(expected);

    const result = await controller.findAll();

    expect(service.findAll).toHaveBeenCalled();
    expect(result).toEqual(expected);
  });

  it('findOne delegates to service', async () => {
    const expected = { id: 'team-id' };
    service.findOne.mockResolvedValue(expected);

    const result = await controller.findOne('team-id');

    expect(service.findOne).toHaveBeenCalledWith('team-id');
    expect(result).toEqual(expected);
  });

  it('update delegates to service', async () => {
    const dto = { name: 'Updated Lions' };
    const expected = { id: 'team-id', ...dto };
    service.update.mockResolvedValue(expected);

    const result = await controller.update('team-id', dto);

    expect(service.update).toHaveBeenCalledWith('team-id', dto);
    expect(result).toEqual(expected);
  });

  it('remove delegates to service', async () => {
    service.remove.mockResolvedValue(undefined);

    const result = await controller.remove('team-id');

    expect(service.remove).toHaveBeenCalledWith('team-id');
    expect(result).toBeUndefined();
  });

  it('findByCamp delegates to service', async () => {
    const expected = [{ id: 'team-id' }];
    service.findByCamp.mockResolvedValue(expected);

    const result = await controller.findByCamp('camp-id');

    expect(service.findByCamp).toHaveBeenCalledWith('camp-id');
    expect(result).toEqual(expected);
  });

  it('cloneFromCampTypeTemplates delegates to service', async () => {
    const expected = [{ id: 'team-id' }];
    service.cloneFromCampTypeTemplates.mockResolvedValue(expected);

    const result = await controller.cloneFromCampTypeTemplates('camp-id', {});

    expect(service.cloneFromCampTypeTemplates).toHaveBeenCalledWith('camp-id');
    expect(result).toEqual(expected);
  });
});
