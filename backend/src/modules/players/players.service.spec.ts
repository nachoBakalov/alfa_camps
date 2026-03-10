import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Player } from './entities/player.entity';
import { PlayersService } from './players.service';

type MockRepository = {
  create: jest.Mock;
  save: jest.Mock;
  find: jest.Mock;
  findOne: jest.Mock;
  merge: jest.Mock;
  remove: jest.Mock;
};

const createRepositoryMock = (): MockRepository => ({
  create: jest.fn(),
  save: jest.fn(),
  find: jest.fn(),
  findOne: jest.fn(),
  merge: jest.fn(),
  remove: jest.fn(),
});

describe('PlayersService', () => {
  let service: PlayersService;
  let playersRepository: MockRepository;

  const player: Player = {
    id: 'player-id',
    firstName: 'Ivan',
    lastName: 'Petrov',
    nickname: 'Ivo',
    avatarUrl: '/avatar.png',
    isActive: true,
    createdAt: new Date('2026-01-01T00:00:00.000Z'),
    updatedAt: new Date('2026-01-01T00:00:00.000Z'),
  };

  beforeEach(async () => {
    playersRepository = createRepositoryMock();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PlayersService,
        {
          provide: getRepositoryToken(Player),
          useValue: playersRepository,
        },
      ],
    }).compile();

    service = module.get<PlayersService>(PlayersService);
  });

  it('create success', async () => {
    const dto = {
      firstName: 'Ivan',
      lastName: 'Petrov',
      nickname: 'Ivo',
      avatarUrl: '/avatar.png',
      isActive: true,
    };

    playersRepository.create.mockReturnValue(player);
    playersRepository.save.mockResolvedValue(player);

    const result = await service.create(dto);

    expect(playersRepository.create).toHaveBeenCalledWith(dto);
    expect(playersRepository.save).toHaveBeenCalledWith(player);
    expect(result).toEqual(player);
  });

  it('findAll without query', async () => {
    playersRepository.find.mockResolvedValue([player]);

    const result = await service.findAll();

    expect(playersRepository.find).toHaveBeenCalledWith({
      order: {
        createdAt: 'DESC',
      },
    });
    expect(result).toEqual([player]);
  });

  it('findAll with q search', async () => {
    playersRepository.find.mockResolvedValue([player]);

    const result = await service.findAll({ q: 'iv' });

    expect(playersRepository.find).toHaveBeenCalledTimes(1);
    const findArg = playersRepository.find.mock.calls[0][0];
    expect(findArg.order).toEqual({ createdAt: 'DESC' });
    expect(findArg.where).toHaveLength(3);
    expect(result).toEqual([player]);
  });

  it('findOne success', async () => {
    playersRepository.findOne.mockResolvedValue(player);

    const result = await service.findOne(player.id);

    expect(playersRepository.findOne).toHaveBeenCalledWith({ where: { id: player.id } });
    expect(result).toEqual(player);
  });

  it('findOne not found', async () => {
    playersRepository.findOne.mockResolvedValue(null);

    await expect(service.findOne('missing-id')).rejects.toThrow(NotFoundException);
  });

  it('update success', async () => {
    const dto = { nickname: 'NewNick' };
    const updatedPlayer = { ...player, ...dto };

    playersRepository.findOne.mockResolvedValue(player);
    playersRepository.merge.mockReturnValue(updatedPlayer);
    playersRepository.save.mockResolvedValue(updatedPlayer);

    const result = await service.update(player.id, dto);

    expect(playersRepository.merge).toHaveBeenCalledWith(player, dto);
    expect(playersRepository.save).toHaveBeenCalledWith(updatedPlayer);
    expect(result).toEqual(updatedPlayer);
  });

  it('update not found', async () => {
    playersRepository.findOne.mockResolvedValue(null);

    await expect(service.update('missing-id', { nickname: 'X' })).rejects.toThrow(
      NotFoundException,
    );
  });

  it('remove success', async () => {
    playersRepository.findOne.mockResolvedValue(player);
    playersRepository.remove.mockResolvedValue(player);

    await service.remove(player.id);

    expect(playersRepository.remove).toHaveBeenCalledWith(player);
  });

  it('remove not found', async () => {
    playersRepository.findOne.mockResolvedValue(null);

    await expect(service.remove('missing-id')).rejects.toThrow(NotFoundException);
  });
});
