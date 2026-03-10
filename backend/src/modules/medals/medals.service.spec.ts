import { ConflictException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { QueryFailedError } from 'typeorm';
import { CampParticipation } from '../camp-participations/entities/camp-participation.entity';
import { MedalDefinition } from './entities/medal-definition.entity';
import { PlayerMedal } from './entities/player-medal.entity';
import { MedalType } from './enums/medal-type.enum';
import { MedalsService } from './medals.service';

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
    constraint: 'UQ_medal_definitions_name',
  } as unknown as Error);

describe('MedalsService', () => {
  let service: MedalsService;
  let definitionsRepository: MockRepository;
  let playerMedalsRepository: MockRepository;
  let participationsRepository: MockRepository;

  const definition: MedalDefinition = {
    id: 'm1',
    name: 'MVP',
    description: null,
    iconUrl: null,
    type: MedalType.MANUAL,
    playerMedals: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const participation: CampParticipation = {
    id: 'p1',
    campId: 'camp-id',
    camp: {} as never,
    playerId: 'player-id',
    player: {} as never,
    kills: 0,
    knifeKills: 0,
    survivals: 0,
    duelWins: 0,
    massBattleWins: 0,
    points: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    definitionsRepository = createRepositoryMock();
    playerMedalsRepository = createRepositoryMock();
    participationsRepository = createRepositoryMock();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MedalsService,
        { provide: getRepositoryToken(MedalDefinition), useValue: definitionsRepository },
        { provide: getRepositoryToken(PlayerMedal), useValue: playerMedalsRepository },
        {
          provide: getRepositoryToken(CampParticipation),
          useValue: participationsRepository,
        },
      ],
    }).compile();

    service = module.get<MedalsService>(MedalsService);
  });

  it('create definition success', async () => {
    definitionsRepository.create.mockReturnValue(definition);
    definitionsRepository.save.mockResolvedValue(definition);

    const result = await service.createDefinition({ name: 'MVP', type: MedalType.MANUAL });

    expect(result).toEqual(definition);
  });

  it('create definition duplicate name -> conflict', async () => {
    definitionsRepository.create.mockReturnValue(definition);
    definitionsRepository.save.mockRejectedValue(createUniqueError());

    await expect(
      service.createDefinition({ name: 'MVP', type: MedalType.MANUAL }),
    ).rejects.toThrow(new ConflictException('Medal definition name already exists'));
  });

  it('findAllDefinitions', async () => {
    definitionsRepository.find.mockResolvedValue([definition]);

    const result = await service.findAllDefinitions();

    expect(result).toEqual([definition]);
  });

  it('findOneDefinition success', async () => {
    definitionsRepository.findOne.mockResolvedValue(definition);

    const result = await service.findOneDefinition(definition.id);

    expect(result).toEqual(definition);
  });

  it('findOneDefinition not found', async () => {
    definitionsRepository.findOne.mockResolvedValue(null);

    await expect(service.findOneDefinition('missing')).rejects.toThrow(NotFoundException);
  });

  it('updateDefinition success', async () => {
    definitionsRepository.findOne.mockResolvedValue(definition);
    definitionsRepository.merge.mockReturnValue({ ...definition, name: 'Best MVP' });
    definitionsRepository.save.mockResolvedValue({ ...definition, name: 'Best MVP' });

    const result = await service.updateDefinition(definition.id, { name: 'Best MVP' });

    expect(result.name).toBe('Best MVP');
  });

  it('updateDefinition not found', async () => {
    definitionsRepository.findOne.mockResolvedValue(null);

    await expect(service.updateDefinition('missing', { name: 'X' })).rejects.toThrow(
      NotFoundException,
    );
  });

  it('removeDefinition success', async () => {
    definitionsRepository.findOne.mockResolvedValue(definition);

    await service.removeDefinition(definition.id);

    expect(definitionsRepository.remove).toHaveBeenCalledWith(definition);
  });

  it('removeDefinition not found', async () => {
    definitionsRepository.findOne.mockResolvedValue(null);

    await expect(service.removeDefinition('missing')).rejects.toThrow(NotFoundException);
  });

  it('award medal success', async () => {
    participationsRepository.findOne.mockResolvedValue(participation);
    definitionsRepository.findOne.mockResolvedValue(definition);
    playerMedalsRepository.findOne.mockResolvedValue(null);
    playerMedalsRepository.create.mockImplementation((payload) => ({
      id: 'pm1',
      participationId: payload.participationId,
      participation: {} as never,
      medalId: payload.medalId,
      medal: {} as never,
      awardedBy: payload.awardedBy,
      awardedByUser: null,
      note: payload.note,
      awardedAt: payload.awardedAt,
      createdAt: new Date(),
      updatedAt: new Date(),
    }));
    playerMedalsRepository.save.mockImplementation(async (payload) => payload);

    const result = await service.awardMedal({ participationId: 'p1', medalId: 'm1' }, 'u1');

    expect(result.participationId).toBe('p1');
    expect(result.medalId).toBe('m1');
    expect(result.awardedBy).toBe('u1');
    expect(result.awardedAt).toBeInstanceOf(Date);
  });

  it('award medal with missing participation -> not found', async () => {
    participationsRepository.findOne.mockResolvedValue(null);

    await expect(
      service.awardMedal({ participationId: 'missing', medalId: 'm1' }),
    ).rejects.toThrow(NotFoundException);
  });

  it('award medal with missing definition -> not found', async () => {
    participationsRepository.findOne.mockResolvedValue(participation);
    definitionsRepository.findOne.mockResolvedValue(null);

    await expect(
      service.awardMedal({ participationId: 'p1', medalId: 'missing' }),
    ).rejects.toThrow(NotFoundException);
  });

  it('award medal duplicate for same participation -> conflict', async () => {
    participationsRepository.findOne.mockResolvedValue(participation);
    definitionsRepository.findOne.mockResolvedValue(definition);
    playerMedalsRepository.findOne.mockResolvedValue({ id: 'pm-existing' });

    await expect(
      service.awardMedal({ participationId: 'p1', medalId: 'm1' }),
    ).rejects.toThrow(new ConflictException('This medal is already awarded to this participation'));
  });

  it('findMedalsByParticipation', async () => {
    participationsRepository.findOne.mockResolvedValue(participation);
    playerMedalsRepository.find.mockResolvedValue([{ id: 'pm1' }]);

    const result = await service.findMedalsByParticipation('p1');

    expect(result).toEqual([{ id: 'pm1' }]);
  });

  it('removeAward success', async () => {
    const playerMedal = {
      id: 'pm1',
      participationId: 'p1',
      participation: {} as never,
      medalId: 'm1',
      medal: {} as never,
      awardedBy: null,
      awardedByUser: null,
      note: null,
      awardedAt: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    playerMedalsRepository.findOne.mockResolvedValue(playerMedal);

    await service.removeAward('pm1');

    expect(playerMedalsRepository.remove).toHaveBeenCalledWith(playerMedal);
  });

  it('removeAward not found', async () => {
    playerMedalsRepository.findOne.mockResolvedValue(null);

    await expect(service.removeAward('missing')).rejects.toThrow(NotFoundException);
  });
});
