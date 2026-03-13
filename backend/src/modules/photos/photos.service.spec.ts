import { BadRequestException, NotFoundException } from '@nestjs/common';
import * as fs from 'fs/promises';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { CampTeam } from '../camp-teams/entities/camp-team.entity';
import { Camp } from '../camps/entities/camp.entity';
import { Player } from '../players/entities/player.entity';
import { Photo } from './entities/photo.entity';
import { PhotosService } from './photos.service';
import { UploadedImageFile } from './types/uploaded-image-file.type';

jest.mock('fs/promises', () => ({
  mkdir: jest.fn(async () => undefined),
  writeFile: jest.fn(async () => undefined),
  unlink: jest.fn(async () => undefined),
}));

type MockRepository = {
  create: jest.Mock;
  save: jest.Mock;
  find: jest.Mock;
  findOne: jest.Mock;
  remove: jest.Mock;
};

const createRepositoryMock = (): MockRepository => ({
  create: jest.fn(),
  save: jest.fn(),
  find: jest.fn(),
  findOne: jest.fn(),
  remove: jest.fn(),
});

describe('PhotosService', () => {
  let service: PhotosService;
  let photosRepository: MockRepository;
  let campsRepository: MockRepository;
  let campTeamsRepository: MockRepository;
  let playersRepository: MockRepository;

  function createUploadFile(overrides?: Partial<UploadedImageFile>): UploadedImageFile {
    return {
      originalname: 'photo.png',
      mimetype: 'image/png',
      size: 1024,
      buffer: Buffer.from('image-bytes'),
      ...overrides,
    };
  }

  beforeEach(async () => {
    photosRepository = createRepositoryMock();
    campsRepository = createRepositoryMock();
    campTeamsRepository = createRepositoryMock();
    playersRepository = createRepositoryMock();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PhotosService,
        { provide: getRepositoryToken(Photo), useValue: photosRepository },
        { provide: getRepositoryToken(Camp), useValue: campsRepository },
        { provide: getRepositoryToken(CampTeam), useValue: campTeamsRepository },
        { provide: getRepositoryToken(Player), useValue: playersRepository },
      ],
    }).compile();

    service = module.get<PhotosService>(PhotosService);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('create success with camp', async () => {
    campsRepository.findOne.mockResolvedValue({ id: 'camp-1' });
    photosRepository.create.mockReturnValue({ id: 'photo-1' });
    photosRepository.save.mockResolvedValue({ id: 'photo-1' });

    const result = await service.create({ campId: 'camp-1', imageUrl: 'https://img/a.jpg' }, 'user-1');

    expect(result).toEqual({ id: 'photo-1' });
    expect(photosRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({ campId: 'camp-1', uploadedBy: 'user-1' }),
    );
  });

  it('create success with team', async () => {
    campTeamsRepository.findOne.mockResolvedValue({ id: 'team-1', campId: 'camp-1' });
    photosRepository.create.mockReturnValue({ id: 'photo-1' });
    photosRepository.save.mockResolvedValue({ id: 'photo-1' });

    const result = await service.create({ teamId: 'team-1', imageUrl: 'https://img/a.jpg' });

    expect(result).toEqual({ id: 'photo-1' });
    expect(photosRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({ teamId: 'team-1' }),
    );
  });

  it('create success with player', async () => {
    playersRepository.findOne.mockResolvedValue({ id: 'player-1' });
    photosRepository.create.mockReturnValue({ id: 'photo-1' });
    photosRepository.save.mockResolvedValue({ id: 'photo-1' });

    const result = await service.create({ playerId: 'player-1', imageUrl: 'https://img/a.jpg' });

    expect(result).toEqual({ id: 'photo-1' });
    expect(photosRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({ playerId: 'player-1' }),
    );
  });

  it('create success with combined camp + team when consistent', async () => {
    campsRepository.findOne.mockResolvedValue({ id: 'camp-1' });
    campTeamsRepository.findOne.mockResolvedValue({ id: 'team-1', campId: 'camp-1' });
    photosRepository.create.mockReturnValue({ id: 'photo-1' });
    photosRepository.save.mockResolvedValue({ id: 'photo-1' });

    const result = await service.create({ campId: 'camp-1', teamId: 'team-1', imageUrl: 'https://img/a.jpg' });

    expect(result).toEqual({ id: 'photo-1' });
  });

  it('create with no target ids -> bad request', async () => {
    await expect(service.create({ imageUrl: 'https://img/a.jpg' })).rejects.toThrow(BadRequestException);
  });

  it('create with missing camp/team/player -> not found', async () => {
    campsRepository.findOne.mockResolvedValue(null);
    campTeamsRepository.findOne.mockResolvedValue(null);
    playersRepository.findOne.mockResolvedValue(null);

    await expect(service.create({ campId: 'missing', imageUrl: 'https://img/a.jpg' })).rejects.toThrow(
      NotFoundException,
    );
    await expect(service.create({ teamId: 'missing', imageUrl: 'https://img/a.jpg' })).rejects.toThrow(
      NotFoundException,
    );
    await expect(service.create({ playerId: 'missing', imageUrl: 'https://img/a.jpg' })).rejects.toThrow(
      NotFoundException,
    );
  });

  it('create with mismatched camp/team -> bad request', async () => {
    campsRepository.findOne.mockResolvedValue({ id: 'camp-1' });
    campTeamsRepository.findOne.mockResolvedValue({ id: 'team-1', campId: 'camp-2' });

    await expect(
      service.create({ campId: 'camp-1', teamId: 'team-1', imageUrl: 'https://img/a.jpg' }),
    ).rejects.toThrow(BadRequestException);
  });

  it('findByCamp', async () => {
    campsRepository.findOne.mockResolvedValue({ id: 'camp-1' });
    photosRepository.find.mockResolvedValue([{ id: 'photo-1' }]);

    const result = await service.findByCamp('camp-1');

    expect(result).toEqual([{ id: 'photo-1' }]);
  });

  it('findByTeam', async () => {
    campTeamsRepository.findOne.mockResolvedValue({ id: 'team-1' });
    photosRepository.find.mockResolvedValue([{ id: 'photo-1' }]);

    const result = await service.findByTeam('team-1');

    expect(result).toEqual([{ id: 'photo-1' }]);
  });

  it('findByPlayer', async () => {
    playersRepository.findOne.mockResolvedValue({ id: 'player-1' });
    photosRepository.find.mockResolvedValue([{ id: 'photo-1' }]);

    const result = await service.findByPlayer('player-1');

    expect(result).toEqual([{ id: 'photo-1' }]);
  });

  it('findOne success', async () => {
    photosRepository.findOne.mockResolvedValue({ id: 'photo-1' });

    const result = await service.findOne('photo-1');

    expect(result).toEqual({ id: 'photo-1' });
  });

  it('findOne not found', async () => {
    photosRepository.findOne.mockResolvedValue(null);

    await expect(service.findOne('missing')).rejects.toThrow(NotFoundException);
  });

  it('remove success', async () => {
    photosRepository.findOne.mockResolvedValue({ id: 'photo-1' });
    photosRepository.remove.mockResolvedValue(undefined);

    await service.remove('photo-1');

    expect(photosRepository.remove).toHaveBeenCalledWith({ id: 'photo-1' });
  });

  it('remove not found', async () => {
    photosRepository.findOne.mockResolvedValue(null);

    await expect(service.remove('missing')).rejects.toThrow(NotFoundException);
  });

  it('createFromUpload with missing target ids -> bad request', async () => {
    await expect(
      service.createFromUpload({} as never, createUploadFile(), 'user-1'),
    ).rejects.toThrow(BadRequestException);
  });

  it('createFromUpload with invalid file type -> bad request', async () => {
    campsRepository.findOne.mockResolvedValue({ id: 'camp-1' });

    await expect(
      service.createFromUpload(
        { campId: 'camp-1' },
        createUploadFile({ mimetype: 'application/pdf' }),
        'user-1',
      ),
    ).rejects.toThrow(BadRequestException);
  });

  it('createFromUpload with missing target entities -> not found', async () => {
    campsRepository.findOne.mockResolvedValue(null);

    await expect(
      service.createFromUpload({ campId: 'missing' }, createUploadFile(), 'user-1'),
    ).rejects.toThrow(NotFoundException);
  });

  it('createFromUpload stores file and saves photo metadata (team folder preferred over camp)', async () => {
    (fs.mkdir as jest.Mock).mockResolvedValue(undefined);
    (fs.writeFile as jest.Mock).mockResolvedValue(undefined);

    campsRepository.findOne.mockResolvedValue({ id: 'camp-1' });
    campTeamsRepository.findOne.mockResolvedValue({ id: 'team-1', campId: 'camp-1' });
    photosRepository.create.mockImplementation((payload) => ({ id: 'photo-1', ...payload }));
    photosRepository.save.mockImplementation(async (value) => value);

    const result = await service.createFromUpload(
      { campId: 'camp-1', teamId: 'team-1' },
      createUploadFile({ originalname: 'battle.webp', mimetype: 'image/webp' }),
      'user-1',
    );

    expect(fs.mkdir).toHaveBeenCalled();
    expect(fs.writeFile).toHaveBeenCalledWith(
      expect.stringMatching(/uploads[\\/]teams[\\/]team-1[\\/].+/),
      expect.any(Buffer),
    );
    expect(photosRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({
        campId: 'camp-1',
        teamId: 'team-1',
        uploadedBy: 'user-1',
        imageUrl: expect.stringMatching(/^\/uploads\/teams\/team-1\/.+/),
      }),
    );
    expect(result).toEqual(expect.objectContaining({ id: 'photo-1' }));
  });

  it('createFromUpload stores in player folder when playerId is provided', async () => {
    (fs.mkdir as jest.Mock).mockResolvedValue(undefined);
    (fs.writeFile as jest.Mock).mockResolvedValue(undefined);

    campsRepository.findOne.mockResolvedValue({ id: 'camp-1' });
    campTeamsRepository.findOne.mockResolvedValue({ id: 'team-1', campId: 'camp-1' });
    playersRepository.findOne.mockResolvedValue({ id: 'player-1' });
    photosRepository.create.mockImplementation((payload) => ({ id: 'photo-2', ...payload }));
    photosRepository.save.mockImplementation(async (value) => value);

    await service.createFromUpload(
      { campId: 'camp-1', teamId: 'team-1', playerId: 'player-1' },
      createUploadFile({ originalname: 'avatar.jpg', mimetype: 'image/jpeg' }),
      'user-2',
    );

    expect(fs.writeFile).toHaveBeenCalledWith(
      expect.stringMatching(/uploads[\\/]players[\\/]player-1[\\/].+/),
      expect.any(Buffer),
    );
    expect(photosRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({
        playerId: 'player-1',
        imageUrl: expect.stringMatching(/^\/uploads\/players\/player-1\/.+/),
      }),
    );
  });
});
