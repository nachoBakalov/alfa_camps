import { ConflictException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { QueryFailedError } from 'typeorm';
import { Camp } from '../camps/entities/camp.entity';
import { CampStatus } from '../camps/enums/camp-status.enum';
import { TeamTemplate } from '../team-templates/entities/team-template.entity';
import { CampTeam } from './entities/camp-team.entity';
import { CampTeamsService } from './camp-teams.service';

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
    constraint: 'UQ_camp_teams_camp_name',
  } as unknown as Error);

describe('CampTeamsService', () => {
  let service: CampTeamsService;
  let campTeamsRepository: MockRepository;
  let campsRepository: MockRepository;
  let teamTemplatesRepository: MockRepository;

  const campId = '21bef665-8a9d-495d-a8b4-fdf284e78d4c';

  const camp: Camp = {
    id: campId,
    campTypeId: '7afe8bc1-fd16-4f39-a469-42a45bc1f156',
    campType: {} as never,
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
    campTeams: [],
  };

  const campTeam: CampTeam = {
    id: 'camp-team-id',
    campId,
    camp,
    name: 'Lions',
    color: 'red',
    logoUrl: '/logo.png',
    teamPoints: 0,
    finalPosition: null,
    isActive: true,
    createdAt: new Date('2026-01-01T00:00:00.000Z'),
    updatedAt: new Date('2026-01-01T00:00:00.000Z'),
  };

  const template: TeamTemplate = {
    id: 'template-id',
    campTypeId: camp.campTypeId,
    campType: {} as never,
    name: 'Lions',
    color: 'red',
    logoUrl: '/logo.png',
    sortOrder: 1,
    createdAt: new Date('2026-01-01T00:00:00.000Z'),
  };

  beforeEach(async () => {
    campTeamsRepository = createRepositoryMock();
    campsRepository = createRepositoryMock();
    teamTemplatesRepository = createRepositoryMock();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CampTeamsService,
        {
          provide: getRepositoryToken(CampTeam),
          useValue: campTeamsRepository,
        },
        {
          provide: getRepositoryToken(Camp),
          useValue: campsRepository,
        },
        {
          provide: getRepositoryToken(TeamTemplate),
          useValue: teamTemplatesRepository,
        },
      ],
    }).compile();

    service = module.get<CampTeamsService>(CampTeamsService);
  });

  it('create success', async () => {
    campsRepository.findOne.mockResolvedValue(camp);
    campTeamsRepository.create.mockReturnValue(campTeam);
    campTeamsRepository.save.mockResolvedValue(campTeam);

    const result = await service.create({
      campId,
      name: 'Lions',
      color: 'red',
      logoUrl: '/logo.png',
      finalPosition: 1,
      isActive: true,
    });

    expect(campsRepository.findOne).toHaveBeenCalledWith({ where: { id: campId } });
    expect(campTeamsRepository.save).toHaveBeenCalledWith(campTeam);
    expect(result).toEqual(campTeam);
  });

  it('create with missing camp -> not found', async () => {
    campsRepository.findOne.mockResolvedValue(null);

    await expect(
      service.create({
        campId,
        name: 'Lions',
      }),
    ).rejects.toThrow(new NotFoundException(`Camp with id ${campId} was not found`));
  });

  it('create duplicate name within same camp -> conflict', async () => {
    campsRepository.findOne.mockResolvedValue(camp);
    campTeamsRepository.create.mockReturnValue(campTeam);
    campTeamsRepository.save.mockRejectedValue(createUniqueError());

    await expect(
      service.create({
        campId,
        name: 'Lions',
      }),
    ).rejects.toThrow(new ConflictException('Camp team name already exists in this camp'));
  });

  it('findAll', async () => {
    campTeamsRepository.find.mockResolvedValue([campTeam]);

    const result = await service.findAll();

    expect(campTeamsRepository.find).toHaveBeenCalledWith({
      order: {
        createdAt: 'DESC',
      },
    });
    expect(result).toEqual([campTeam]);
  });

  it('findOne success', async () => {
    campTeamsRepository.findOne.mockResolvedValue(campTeam);

    const result = await service.findOne(campTeam.id);

    expect(campTeamsRepository.findOne).toHaveBeenCalledWith({
      where: { id: campTeam.id },
    });
    expect(result).toEqual(campTeam);
  });

  it('findOne not found', async () => {
    campTeamsRepository.findOne.mockResolvedValue(null);

    await expect(service.findOne('missing-id')).rejects.toThrow(NotFoundException);
  });

  it('findByCamp', async () => {
    campsRepository.findOne.mockResolvedValue(camp);
    campTeamsRepository.find.mockResolvedValue([campTeam]);

    const result = await service.findByCamp(campId);

    expect(campsRepository.findOne).toHaveBeenCalledWith({ where: { id: campId } });
    expect(campTeamsRepository.find).toHaveBeenCalledWith({
      where: { campId },
      order: {
        createdAt: 'ASC',
      },
    });
    expect(result).toEqual([campTeam]);
  });

  it('update success', async () => {
    const dto = { name: 'Updated Lions' };
    const updated = { ...campTeam, ...dto };

    campTeamsRepository.findOne.mockResolvedValue(campTeam);
    campTeamsRepository.merge.mockReturnValue(updated);
    campTeamsRepository.save.mockResolvedValue(updated);

    const result = await service.update(campTeam.id, dto);

    expect(campTeamsRepository.merge).toHaveBeenCalledWith(campTeam, dto);
    expect(campTeamsRepository.save).toHaveBeenCalledWith(updated);
    expect(result).toEqual(updated);
  });

  it('update not found', async () => {
    campTeamsRepository.findOne.mockResolvedValue(null);

    await expect(service.update('missing-id', { name: 'Updated' })).rejects.toThrow(
      NotFoundException,
    );
  });

  it('remove success', async () => {
    campTeamsRepository.findOne.mockResolvedValue(campTeam);
    campTeamsRepository.remove.mockResolvedValue(campTeam);

    await service.remove(campTeam.id);

    expect(campTeamsRepository.remove).toHaveBeenCalledWith(campTeam);
  });

  it('remove not found', async () => {
    campTeamsRepository.findOne.mockResolvedValue(null);

    await expect(service.remove('missing-id')).rejects.toThrow(NotFoundException);
  });

  it('cloneFromCampTypeTemplates success', async () => {
    const newTeam = { ...campTeam, id: 'new-team' };

    campsRepository.findOne.mockResolvedValue(camp);
    teamTemplatesRepository.find.mockResolvedValue([template]);
    campTeamsRepository.find
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([newTeam]);
    campTeamsRepository.create.mockReturnValue(newTeam);
    campTeamsRepository.save.mockResolvedValue([newTeam]);

    const result = await service.cloneFromCampTypeTemplates(campId);

    expect(teamTemplatesRepository.find).toHaveBeenCalledWith({
      where: { campTypeId: camp.campTypeId },
      order: { sortOrder: 'ASC', createdAt: 'ASC' },
    });
    expect(campTeamsRepository.create).toHaveBeenCalled();
    expect(result).toEqual([newTeam]);
  });

  it('cloneFromCampTypeTemplates with missing camp -> not found', async () => {
    campsRepository.findOne.mockResolvedValue(null);

    await expect(service.cloneFromCampTypeTemplates(campId)).rejects.toThrow(
      new NotFoundException(`Camp with id ${campId} was not found`),
    );
  });

  it('cloneFromCampTypeTemplates should avoid duplicates', async () => {
    campsRepository.findOne.mockResolvedValue(camp);
    teamTemplatesRepository.find.mockResolvedValue([template]);
    campTeamsRepository.find
      .mockResolvedValueOnce([campTeam])
      .mockResolvedValueOnce([campTeam]);

    const result = await service.cloneFromCampTypeTemplates(campId);

    expect(campTeamsRepository.create).not.toHaveBeenCalled();
    expect(campTeamsRepository.save).not.toHaveBeenCalled();
    expect(result).toEqual([campTeam]);
  });
});
