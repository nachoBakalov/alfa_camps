import { Test, TestingModule } from '@nestjs/testing';
import { BattleType } from '../battles/enums/battle-type.enum';
import { ScoringController } from './scoring.controller';
import { ScoringService } from './scoring.service';

const createServiceMock = () => ({
  previewBattleScore: jest.fn(),
  applyBattleScore: jest.fn(),
  finalizeCampScore: jest.fn(),
});

describe('ScoringController', () => {
  let controller: ScoringController;
  let service: ReturnType<typeof createServiceMock>;

  beforeEach(async () => {
    service = createServiceMock();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [ScoringController],
      providers: [
        {
          provide: ScoringService,
          useValue: service,
        },
      ],
    }).compile();

    controller = module.get<ScoringController>(ScoringController);
  });

  it('controller is defined', () => {
    expect(controller).toBeDefined();
  });

  it('score preview delegates to service', async () => {
    const expected = {
      battleId: 'battle-id',
      battleType: BattleType.MASS_BATTLE,
      participationDeltas: [],
      teamDeltas: [],
    };
    service.previewBattleScore.mockResolvedValue(expected);

    const result = await controller.previewBattleScore('battle-id');

    expect(service.previewBattleScore).toHaveBeenCalledWith('battle-id');
    expect(result).toEqual(expected);
  });

  it('apply-score delegates to service', async () => {
    const expected = {
      battleId: 'battle-id',
      battleType: BattleType.DUEL_SESSION,
      appliedParticipationCount: 1,
      appliedTeamCount: 0,
      message: 'Battle score deltas applied successfully',
    };
    service.applyBattleScore.mockResolvedValue(expected);

    const result = await controller.applyBattleScore('battle-id');

    expect(service.applyBattleScore).toHaveBeenCalledWith('battle-id');
    expect(result).toEqual(expected);
  });

  it('finalize-score delegates to service', async () => {
    const expected = {
      campId: 'camp-id',
      finalized: true,
      alreadyFinalized: false,
      appliedParticipationCount: 3,
      message: 'Camp score finalized successfully',
    };
    service.finalizeCampScore.mockResolvedValue(expected);

    const result = await controller.finalizeCampScore('camp-id');

    expect(service.finalizeCampScore).toHaveBeenCalledWith('camp-id');
    expect(result).toEqual(expected);
  });
});
