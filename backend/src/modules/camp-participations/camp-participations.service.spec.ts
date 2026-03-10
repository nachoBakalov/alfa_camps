import { ConflictException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { QueryFailedError } from 'typeorm';
import { Camp } from '../camps/entities/camp.entity';
import { CampStatus } from '../camps/enums/camp-status.enum';
import { Player } from '../players/entities/player.entity';
import { CampParticipation } from './entities/camp-participation.entity';
import { CampParticipationsService } from './camp-participations.service';

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

const createUniqueError = (): QueryFailedError =>
  new QueryFailedError('QUERY', [], {
    code: '23505',
    constraint: 'UQ_camp_participations_camp_player',
  } as unknown as Error);

describe('CampParticipationsService', () => {
  let service: CampParticipationsService;
  let campParticipationsRepository: MockRepository;
  let campsRepository: MockRepository;
  let playersRepository: MockRepository;

  const campId = 'd72ffc89-280f-4bf2-9f5f-9f21644b9911';
  const playerId = 'e3f9e3c6-d3b8-4d9f-8441-d3a3c0e2ec3d';

  const camp: Camp = {
    id: campId,
    campTypeId: 'camp-type-id',
    campType: {} as never,
    campTeams: [],
    title: 'Summer Camp',
    year: 2026,
    startDate: '2026-07-01',
    endDate: '2026-07-10',
    location: null,
    description: null,
    logoUrl: null,
    coverImageUrl: null,
    status: CampStatus.DRAFT,
    createdBy: null,
    createdByUser: null,
    finalizedAt: null,
    createdAt: new Date('2026-01-01T00:00:00.000Z'),
    updatedAt: new Date('2026-01-01T00:00:00.000Z'),
  };

  const player: Player = {
    id: playerId,
    firstName: 'Ivan',
    lastName: 'Petrov',
    nickname: 'Ivo',
    avatarUrl: null,
    isActive: true,
    createdAt: new Date('2026-01-01T00:00:00.000Z'),
    updatedAt: new Date('2026-01-01T00:00:00.000Z'),
  };

  const participation: CampParticipation = {
    id: 'participation-id',
    campId,
    camp,
    playerId,
    player,
    kills: 0,
    knifeKills: 0,
    survivals: 0,
    duelWins: 0,
    massBattleWins: 0,
    points: 0,
    createdAt: new Date('2026-01-01T00:00:00.000Z'),
    updatedAt: new Date('2026-01-01T00:00:00.000Z'),
  };

  beforeEach(async () => {
    campParticipationsRepository = createRepositoryMock();
    campsRepository = createRepositoryMock();
    playersRepository = createRepositoryMock();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CampParticipationsService,
        {
          provide: getRepositoryToken(CampParticipation),
          useValue: campParticipationsRepository,
        },
        {
          provide: getRepositoryToken(Camp),
          useValue: campsRepository,
        },
        {
          provide: getRepositoryToken(Player),
          useValue: playersRepository,
        },
      ],
    }).compile();

    service = module.get<CampParticipationsService>(CampParticipationsService);
  });

  it('create success', async () => {
    campsRepository.findOne.mockResolvedValue(camp);
    playersRepository.findOne.mockResolvedValue(player);
    campParticipationsRepository.create.mockReturnValue(participation);
    campParticipationsRepository.save.mockResolvedValue(participation);

    const result = await service.create({ campId, playerId });

    expect(campsRepository.findOne).toHaveBeenCalledWith({ where: { id: campId } });
    expect(playersRepository.findOne).toHaveBeenCalledWith({ where: { id: playerId } });
    expect(campParticipationsRepository.save).toHaveBeenCalledWith(participation);
    expect(result).toEqual(participation);
  });

  it('create with missing camp -> not found', async () => {
    campsRepository.findOne.mockResolvedValue(null);

    await expect(service.create({ campId, playerId })).rejects.toThrow(
      new NotFoundException(`Camp with id ${campId} was not found`),
    );
  });

  it('create with missing player -> not found', async () => {
    campsRepository.findOne.mockResolvedValue(camp);
    playersRepository.findOne.mockResolvedValue(null);

    await expect(service.create({ campId, playerId })).rejects.toThrow(
      new NotFoundException(`Player with id ${playerId} was not found`),
    );
  });

  it('create duplicate participation -> conflict', async () => {
    campsRepository.findOne.mockResolvedValue(camp);
    playersRepository.findOne.mockResolvedValue(player);
    campParticipationsRepository.create.mockReturnValue(participation);
    campParticipationsRepository.save.mockRejectedValue(createUniqueError());

    await expect(service.create({ campId, playerId })).rejects.toThrow(
      new ConflictException('Participation already exists for this camp and player'),
    );
  });

  it('findAll', async () => {
    campParticipationsRepository.find.mockResolvedValue([participation]);

    const result = await service.findAll();

    expect(campParticipationsRepository.find).toHaveBeenCalledWith({
      order: {
        createdAt: 'DESC',
      },
    });
    expect(result).toEqual([participation]);
  });

  it('findOne success', async () => {
    campParticipationsRepository.findOne.mockResolvedValue(participation);

    const result = await service.findOne(participation.id);

    expect(campParticipationsRepository.findOne).toHaveBeenCalledWith({
      where: { id: participation.id },
    });
    expect(result).toEqual(participation);
  });

  it('findOne not found', async () => {
    campParticipationsRepository.findOne.mockResolvedValue(null);

    await expect(service.findOne('missing-id')).rejects.toThrow(NotFoundException);
  });

  it('findByCamp', async () => {
    campsRepository.findOne.mockResolvedValue(camp);
    campParticipationsRepository.find.mockResolvedValue([participation]);

    const result = await service.findByCamp(campId);

    expect(campParticipationsRepository.find).toHaveBeenCalledWith({
      where: { campId },
      order: {
        createdAt: 'ASC',
      },
    });
    expect(result).toEqual([participation]);
  });

  it('findByPlayer', async () => {
    playersRepository.findOne.mockResolvedValue(player);
    campParticipationsRepository.find.mockResolvedValue([participation]);

    const result = await service.findByPlayer(playerId);

    expect(campParticipationsRepository.find).toHaveBeenCalledWith({
      where: { playerId },
      order: {
        createdAt: 'ASC',
      },
    });
    expect(result).toEqual([participation]);
  });

  it('update success', async () => {
    const dto = { kills: 4, points: 25 };
    const updated = { ...participation, ...dto };

    campParticipationsRepository.findOne.mockResolvedValue(participation);
    campParticipationsRepository.merge.mockReturnValue(updated);
    campParticipationsRepository.save.mockResolvedValue(updated);

    const result = await service.update(participation.id, dto);

    expect(campParticipationsRepository.merge).toHaveBeenCalledWith(participation, dto);
    expect(campParticipationsRepository.save).toHaveBeenCalledWith(updated);
    expect(result).toEqual(updated);
  });

  it('update not found', async () => {
    campParticipationsRepository.findOne.mockResolvedValue(null);

    await expect(service.update('missing-id', { kills: 1 })).rejects.toThrow(
      NotFoundException,
    );
  });

  it('remove success', async () => {
    campParticipationsRepository.findOne.mockResolvedValue(participation);
    campParticipationsRepository.remove.mockResolvedValue(participation);

    await service.remove(participation.id);

    expect(campParticipationsRepository.remove).toHaveBeenCalledWith(participation);
  });

  it('remove not found', async () => {
    campParticipationsRepository.findOne.mockResolvedValue(null);

    await expect(service.remove('missing-id')).rejects.toThrow(NotFoundException);
  });
});
