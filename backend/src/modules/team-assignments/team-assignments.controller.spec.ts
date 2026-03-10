import { Test, TestingModule } from '@nestjs/testing';
import { TeamAssignmentsController } from './team-assignments.controller';
import { TeamAssignmentsService } from './team-assignments.service';

const createServiceMock = () => ({
  create: jest.fn(),
  findAll: jest.fn(),
  findOne: jest.fn(),
  update: jest.fn(),
  remove: jest.fn(),
  findByParticipation: jest.fn(),
  findCurrentByParticipation: jest.fn(),
});

describe('TeamAssignmentsController', () => {
  let controller: TeamAssignmentsController;
  let service: ReturnType<typeof createServiceMock>;

  beforeEach(async () => {
    service = createServiceMock();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [TeamAssignmentsController],
      providers: [
        {
          provide: TeamAssignmentsService,
          useValue: service,
        },
      ],
    }).compile();

    controller = module.get<TeamAssignmentsController>(TeamAssignmentsController);
  });

  it('controller is defined', () => {
    expect(controller).toBeDefined();
  });

  it('create delegates to service', async () => {
    const dto = {
      participationId: 'participation-id',
      teamId: 'team-id',
      assignedAt: '2026-07-01T10:00:00.000Z',
      note: 'Initial assignment',
    };
    const request = {
      user: {
        sub: 'user-id',
      },
    };
    const expected = { id: 'assignment-id', ...dto, assignedBy: 'user-id' };
    service.create.mockResolvedValue(expected);

    const result = await controller.create(dto, request);

    expect(service.create).toHaveBeenCalledWith(dto, 'user-id');
    expect(result).toEqual(expected);
  });

  it('findAll delegates to service', async () => {
    const expected = [{ id: 'a1' }, { id: 'a2' }];
    service.findAll.mockResolvedValue(expected);

    const result = await controller.findAll();

    expect(service.findAll).toHaveBeenCalled();
    expect(result).toEqual(expected);
  });

  it('findOne delegates to service', async () => {
    const expected = { id: 'assignment-id' };
    service.findOne.mockResolvedValue(expected);

    const result = await controller.findOne('assignment-id');

    expect(service.findOne).toHaveBeenCalledWith('assignment-id');
    expect(result).toEqual(expected);
  });

  it('update delegates to service', async () => {
    const dto = { note: 'Updated note' };
    const expected = { id: 'assignment-id', ...dto };
    service.update.mockResolvedValue(expected);

    const result = await controller.update('assignment-id', dto);

    expect(service.update).toHaveBeenCalledWith('assignment-id', dto);
    expect(result).toEqual(expected);
  });

  it('remove delegates to service', async () => {
    service.remove.mockResolvedValue(undefined);

    const result = await controller.remove('assignment-id');

    expect(service.remove).toHaveBeenCalledWith('assignment-id');
    expect(result).toBeUndefined();
  });

  it('findByParticipation delegates to service', async () => {
    const expected = [{ id: 'assignment-id' }];
    service.findByParticipation.mockResolvedValue(expected);

    const result = await controller.findByParticipation('participation-id');

    expect(service.findByParticipation).toHaveBeenCalledWith('participation-id');
    expect(result).toEqual(expected);
  });

  it('findCurrentByParticipation delegates to service', async () => {
    const expected = { id: 'assignment-id' };
    service.findCurrentByParticipation.mockResolvedValue(expected);

    const result = await controller.findCurrentByParticipation('participation-id');

    expect(service.findCurrentByParticipation).toHaveBeenCalledWith('participation-id');
    expect(result).toEqual(expected);
  });
});
