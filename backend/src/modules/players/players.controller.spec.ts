import { Test, TestingModule } from '@nestjs/testing';
import { PlayersController } from './players.controller';
import { PlayersService } from './players.service';

const createServiceMock = () => ({
  create: jest.fn(),
  findAll: jest.fn(),
  findOne: jest.fn(),
  update: jest.fn(),
  remove: jest.fn(),
});

describe('PlayersController', () => {
  let controller: PlayersController;
  let service: ReturnType<typeof createServiceMock>;

  beforeEach(async () => {
    service = createServiceMock();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [PlayersController],
      providers: [
        {
          provide: PlayersService,
          useValue: service,
        },
      ],
    }).compile();

    controller = module.get<PlayersController>(PlayersController);
  });

  it('controller is defined', () => {
    expect(controller).toBeDefined();
  });

  it('create delegates to service', async () => {
    const dto = {
      firstName: 'Ivan',
      lastName: 'Petrov',
      nickname: 'Ivo',
      avatarUrl: '/avatar.png',
      isActive: true,
    };
    const expected = { id: 'player-id', ...dto };
    service.create.mockResolvedValue(expected);

    const result = await controller.create(dto);

    expect(service.create).toHaveBeenCalledWith(dto);
    expect(result).toEqual(expected);
  });

  it('findAll delegates to service', async () => {
    const query = { q: 'iv' };
    const expected = [{ id: 'player-1' }, { id: 'player-2' }];
    service.findAll.mockResolvedValue(expected);

    const result = await controller.findAll(query);

    expect(service.findAll).toHaveBeenCalledWith(query);
    expect(result).toEqual(expected);
  });

  it('findOne delegates to service', async () => {
    const expected = { id: 'player-id' };
    service.findOne.mockResolvedValue(expected);

    const result = await controller.findOne('player-id');

    expect(service.findOne).toHaveBeenCalledWith('player-id');
    expect(result).toEqual(expected);
  });

  it('update delegates to service', async () => {
    const dto = { nickname: 'NewNick' };
    const expected = { id: 'player-id', ...dto };
    service.update.mockResolvedValue(expected);

    const result = await controller.update('player-id', dto);

    expect(service.update).toHaveBeenCalledWith('player-id', dto);
    expect(result).toEqual(expected);
  });

  it('remove delegates to service', async () => {
    service.remove.mockResolvedValue(undefined);

    const result = await controller.remove('player-id');

    expect(service.remove).toHaveBeenCalledWith('player-id');
    expect(result).toBeUndefined();
  });
});
