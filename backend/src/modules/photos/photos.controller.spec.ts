import { Test, TestingModule } from '@nestjs/testing';
import { PhotosController } from './photos.controller';
import { PhotosService } from './photos.service';

const createServiceMock = () => ({
  create: jest.fn(),
  remove: jest.fn(),
  findByCamp: jest.fn(),
  findByTeam: jest.fn(),
  findByPlayer: jest.fn(),
});

describe('PhotosController', () => {
  let controller: PhotosController;
  let service: ReturnType<typeof createServiceMock>;

  beforeEach(async () => {
    service = createServiceMock();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [PhotosController],
      providers: [{ provide: PhotosService, useValue: service }],
    }).compile();

    controller = module.get<PhotosController>(PhotosController);
  });

  it('controller is defined', () => {
    expect(controller).toBeDefined();
  });

  it('create delegates to service', async () => {
    service.create.mockResolvedValue({ id: 'photo-1' });

    const result = await controller.create(
      { campId: 'camp-1', imageUrl: 'https://img/a.jpg' },
      { user: { sub: 'user-1' } },
    );

    expect(service.create).toHaveBeenCalledWith(
      { campId: 'camp-1', imageUrl: 'https://img/a.jpg' },
      'user-1',
    );
    expect(result).toEqual({ id: 'photo-1' });
  });

  it('delete delegates to service', async () => {
    service.remove.mockResolvedValue(undefined);

    await controller.remove('photo-1');

    expect(service.remove).toHaveBeenCalledWith('photo-1');
  });

  it('get camp photos delegates to service', async () => {
    service.findByCamp.mockResolvedValue([{ id: 'photo-1' }]);

    const result = await controller.findByCamp('camp-1');

    expect(service.findByCamp).toHaveBeenCalledWith('camp-1');
    expect(result).toEqual([{ id: 'photo-1' }]);
  });

  it('get team photos delegates to service', async () => {
    service.findByTeam.mockResolvedValue([{ id: 'photo-1' }]);

    const result = await controller.findByTeam('team-1');

    expect(service.findByTeam).toHaveBeenCalledWith('team-1');
    expect(result).toEqual([{ id: 'photo-1' }]);
  });

  it('get player photos delegates to service', async () => {
    service.findByPlayer.mockResolvedValue([{ id: 'photo-1' }]);

    const result = await controller.findByPlayer('player-1');

    expect(service.findByPlayer).toHaveBeenCalledWith('player-1');
    expect(result).toEqual([{ id: 'photo-1' }]);
  });
});
