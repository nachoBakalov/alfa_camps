import { Test, TestingModule } from '@nestjs/testing';
import { BattlePlayerResultsController } from './battle-player-results.controller';
import { BattlePlayerResultsService } from './battle-player-results.service';

const createServiceMock = () => ({
  create: jest.fn(),
  findAll: jest.fn(),
  findOne: jest.fn(),
  update: jest.fn(),
  remove: jest.fn(),
  findByBattle: jest.fn(),
  findByParticipation: jest.fn(),
});

describe('BattlePlayerResultsController', () => {
  let controller: BattlePlayerResultsController;
  let service: ReturnType<typeof createServiceMock>;

  beforeEach(async () => {
    service = createServiceMock();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [BattlePlayerResultsController],
      providers: [
        {
          provide: BattlePlayerResultsService,
          useValue: service,
        },
      ],
    }).compile();

    controller = module.get<BattlePlayerResultsController>(BattlePlayerResultsController);
  });

  it('controller is defined', () => {
    expect(controller).toBeDefined();
  });

  it('create delegates to service', async () => {
    const dto = {
      battleId: 'battle-id',
      participationId: 'participation-id',
      teamId: 'team-id',
      kills: 2,
      knifeKills: 1,
      survived: true,
    };
    const expected = { id: 'result-id', ...dto };
    service.create.mockResolvedValue(expected);

    const result = await controller.create(dto);

    expect(service.create).toHaveBeenCalledWith(dto);
    expect(result).toEqual(expected);
  });

  it('findAll delegates to service', async () => {
    const expected = [{ id: 'r1' }, { id: 'r2' }];
    service.findAll.mockResolvedValue(expected);

    const result = await controller.findAll();

    expect(service.findAll).toHaveBeenCalled();
    expect(result).toEqual(expected);
  });

  it('findOne delegates to service', async () => {
    const expected = { id: 'result-id' };
    service.findOne.mockResolvedValue(expected);

    const result = await controller.findOne('result-id');

    expect(service.findOne).toHaveBeenCalledWith('result-id');
    expect(result).toEqual(expected);
  });

  it('update delegates to service', async () => {
    const dto = { kills: 5 };
    const expected = { id: 'result-id', ...dto };
    service.update.mockResolvedValue(expected);

    const result = await controller.update('result-id', dto);

    expect(service.update).toHaveBeenCalledWith('result-id', dto);
    expect(result).toEqual(expected);
  });

  it('remove delegates to service', async () => {
    service.remove.mockResolvedValue(undefined);

    const result = await controller.remove('result-id');

    expect(service.remove).toHaveBeenCalledWith('result-id');
    expect(result).toBeUndefined();
  });

  it('findByBattle delegates to service', async () => {
    const expected = [{ id: 'result-id' }];
    service.findByBattle.mockResolvedValue(expected);

    const result = await controller.findByBattle('battle-id');

    expect(service.findByBattle).toHaveBeenCalledWith('battle-id');
    expect(result).toEqual(expected);
  });

  it('findByParticipation delegates to service', async () => {
    const expected = [{ id: 'result-id' }];
    service.findByParticipation.mockResolvedValue(expected);

    const result = await controller.findByParticipation('participation-id');

    expect(service.findByParticipation).toHaveBeenCalledWith('participation-id');
    expect(result).toEqual(expected);
  });
});
