import { Test, TestingModule } from '@nestjs/testing';
import { CampPublicController } from './camp-public.controller';
import { CampPublicService } from './camp-public.service';

const createServiceMock = () => ({
  getCampPublicDetails: jest.fn(),
  getCampPublicTeams: jest.fn(),
  getCampPublicParticipants: jest.fn(),
});

describe('CampPublicController', () => {
  let controller: CampPublicController;
  let service: ReturnType<typeof createServiceMock>;

  beforeEach(async () => {
    service = createServiceMock();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [CampPublicController],
      providers: [{ provide: CampPublicService, useValue: service }],
    }).compile();

    controller = module.get<CampPublicController>(CampPublicController);
  });

  it('controller is defined', () => {
    expect(controller).toBeDefined();
  });

  it('public details delegates to service', async () => {
    service.getCampPublicDetails.mockResolvedValue({ campId: 'camp-1' });

    const result = await controller.getCampPublicDetails('camp-1');

    expect(service.getCampPublicDetails).toHaveBeenCalledWith('camp-1');
    expect(result).toEqual({ campId: 'camp-1' });
  });

  it('public teams delegates to service', async () => {
    service.getCampPublicTeams.mockResolvedValue([{ teamId: 't1' }]);

    const result = await controller.getCampPublicTeams('camp-1');

    expect(service.getCampPublicTeams).toHaveBeenCalledWith('camp-1');
    expect(result).toEqual([{ teamId: 't1' }]);
  });

  it('public participants delegates to service', async () => {
    service.getCampPublicParticipants.mockResolvedValue([{ participationId: 'p1' }]);

    const result = await controller.getCampPublicParticipants('camp-1');

    expect(service.getCampPublicParticipants).toHaveBeenCalledWith('camp-1');
    expect(result).toEqual([{ participationId: 'p1' }]);
  });
});
