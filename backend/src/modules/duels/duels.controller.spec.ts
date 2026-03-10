import { Test, TestingModule } from '@nestjs/testing';
import { CreateDuelDto } from './dto/create-duel.dto';
import { DuelsController } from './duels.controller';
import { DuelsService } from './duels.service';

const createServiceMock = () => ({
  create: jest.fn(),
  findAll: jest.fn(),
  findOne: jest.fn(),
  update: jest.fn(),
  remove: jest.fn(),
  findByBattle: jest.fn(),
  findByParticipation: jest.fn(),
});

describe('DuelsController', () => {
  let controller: DuelsController;
  let service: ReturnType<typeof createServiceMock>;

  beforeEach(async () => {
    service = createServiceMock();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [DuelsController],
      providers: [
        {
          provide: DuelsService,
          useValue: service,
        },
      ],
    }).compile();

    controller = module.get<DuelsController>(DuelsController);
  });

  it('controller is defined', () => {
    expect(controller).toBeDefined();
  });

  it('create delegates to service', async () => {
    const dto: CreateDuelDto = {
      battleId: 'battle-id',
      playerAParticipationId: 'player-a-id',
      playerBParticipationId: 'player-b-id',
    };
    const expected = { id: 'duel-id', ...dto };
    service.create.mockResolvedValue(expected);

    const result = await controller.create(dto);

    expect(service.create).toHaveBeenCalledWith(dto);
    expect(result).toEqual(expected);
  });

  it('findAll delegates to service', async () => {
    const expected = [{ id: 'd1' }, { id: 'd2' }];
    service.findAll.mockResolvedValue(expected);

    const result = await controller.findAll();

    expect(service.findAll).toHaveBeenCalled();
    expect(result).toEqual(expected);
  });

  it('findOne delegates to service', async () => {
    const expected = { id: 'duel-id' };
    service.findOne.mockResolvedValue(expected);

    const result = await controller.findOne('duel-id');

    expect(service.findOne).toHaveBeenCalledWith('duel-id');
    expect(result).toEqual(expected);
  });

  it('update delegates to service', async () => {
    const dto = { winnerParticipationId: 'player-a-id' };
    const expected = { id: 'duel-id', ...dto };
    service.update.mockResolvedValue(expected);

    const result = await controller.update('duel-id', dto);

    expect(service.update).toHaveBeenCalledWith('duel-id', dto);
    expect(result).toEqual(expected);
  });

  it('remove delegates to service', async () => {
    service.remove.mockResolvedValue(undefined);

    const result = await controller.remove('duel-id');

    expect(service.remove).toHaveBeenCalledWith('duel-id');
    expect(result).toBeUndefined();
  });

  it('findByBattle delegates to service', async () => {
    const expected = [{ id: 'duel-id' }];
    service.findByBattle.mockResolvedValue(expected);

    const result = await controller.findByBattle('battle-id');

    expect(service.findByBattle).toHaveBeenCalledWith('battle-id');
    expect(result).toEqual(expected);
  });

  it('findByParticipation delegates to service', async () => {
    const expected = [{ id: 'duel-id' }];
    service.findByParticipation.mockResolvedValue(expected);

    const result = await controller.findByParticipation('participation-id');

    expect(service.findByParticipation).toHaveBeenCalledWith('participation-id');
    expect(result).toEqual(expected);
  });
});
