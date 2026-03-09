import { ConflictException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { QueryFailedError } from 'typeorm';
import { CampType } from '../camp-types/entities/camp-type.entity';
import { TeamTemplate } from './entities/team-template.entity';
import { TeamTemplatesService } from './team-templates.service';

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
    constraint: 'UQ_team_templates_camp_type_name',
  } as unknown as Error);

describe('TeamTemplatesService', () => {
  let service: TeamTemplatesService;
  let teamTemplatesRepository: MockRepository;
  let campTypesRepository: MockRepository;

  const campTypeId = '8ef7685b-6c18-4e88-94a4-f807f987bf58';

  const campType: CampType = {
    id: campTypeId,
    name: 'Camp Type',
    slug: 'camp-type',
    description: null,
    logoUrl: null,
    coverImageUrl: null,
    createdAt: new Date('2026-01-01T00:00:00.000Z'),
    updatedAt: new Date('2026-01-01T00:00:00.000Z'),
    teamTemplates: [],
  };

  const teamTemplate: TeamTemplate = {
    id: 'team-template-id',
    campTypeId,
    campType,
    name: 'Lions',
    color: 'red',
    logoUrl: '/logo.png',
    sortOrder: 1,
    createdAt: new Date('2026-01-01T00:00:00.000Z'),
  };

  beforeEach(async () => {
    teamTemplatesRepository = createRepositoryMock();
    campTypesRepository = createRepositoryMock();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TeamTemplatesService,
        {
          provide: getRepositoryToken(TeamTemplate),
          useValue: teamTemplatesRepository,
        },
        {
          provide: getRepositoryToken(CampType),
          useValue: campTypesRepository,
        },
      ],
    }).compile();

    service = module.get<TeamTemplatesService>(TeamTemplatesService);
  });

  it('create success', async () => {
    campTypesRepository.findOne.mockResolvedValue(campType);
    teamTemplatesRepository.create.mockReturnValue(teamTemplate);
    teamTemplatesRepository.save.mockResolvedValue(teamTemplate);

    const result = await service.create({
      campTypeId,
      name: 'Lions',
      color: 'red',
      logoUrl: '/logo.png',
      sortOrder: 1,
    });

    expect(campTypesRepository.findOne).toHaveBeenCalledWith({ where: { id: campTypeId } });
    expect(teamTemplatesRepository.save).toHaveBeenCalledWith(teamTemplate);
    expect(result).toEqual(teamTemplate);
  });

  it('create with missing camp type -> not found', async () => {
    campTypesRepository.findOne.mockResolvedValue(null);

    await expect(
      service.create({
        campTypeId,
        name: 'Lions',
      }),
    ).rejects.toThrow(new NotFoundException(`Camp type with id ${campTypeId} was not found`));
  });

  it('create duplicate name within same camp type -> conflict', async () => {
    campTypesRepository.findOne.mockResolvedValue(campType);
    teamTemplatesRepository.create.mockReturnValue(teamTemplate);
    teamTemplatesRepository.save.mockRejectedValue(createUniqueError());

    await expect(
      service.create({
        campTypeId,
        name: 'Lions',
      }),
    ).rejects.toThrow(
      new ConflictException('Team template name already exists for this camp type'),
    );
  });

  it('findAll', async () => {
    teamTemplatesRepository.find.mockResolvedValue([teamTemplate]);

    const result = await service.findAll();

    expect(teamTemplatesRepository.find).toHaveBeenCalledWith({
      order: {
        createdAt: 'DESC',
      },
    });
    expect(result).toEqual([teamTemplate]);
  });

  it('findOne success', async () => {
    teamTemplatesRepository.findOne.mockResolvedValue(teamTemplate);

    const result = await service.findOne(teamTemplate.id);

    expect(teamTemplatesRepository.findOne).toHaveBeenCalledWith({
      where: { id: teamTemplate.id },
    });
    expect(result).toEqual(teamTemplate);
  });

  it('findOne not found', async () => {
    teamTemplatesRepository.findOne.mockResolvedValue(null);

    await expect(service.findOne('missing-id')).rejects.toThrow(NotFoundException);
  });

  it('findByCampType', async () => {
    campTypesRepository.findOne.mockResolvedValue(campType);
    teamTemplatesRepository.find.mockResolvedValue([teamTemplate]);

    const result = await service.findByCampType(campTypeId);

    expect(campTypesRepository.findOne).toHaveBeenCalledWith({ where: { id: campTypeId } });
    expect(teamTemplatesRepository.find).toHaveBeenCalledWith({
      where: { campTypeId },
      order: {
        sortOrder: 'ASC',
        createdAt: 'ASC',
      },
    });
    expect(result).toEqual([teamTemplate]);
  });

  it('update success', async () => {
    const dto = { name: 'Updated Lions', sortOrder: 2 };
    const updatedTeamTemplate = { ...teamTemplate, ...dto };

    teamTemplatesRepository.findOne.mockResolvedValue(teamTemplate);
    teamTemplatesRepository.merge.mockReturnValue(updatedTeamTemplate);
    teamTemplatesRepository.save.mockResolvedValue(updatedTeamTemplate);

    const result = await service.update(teamTemplate.id, dto);

    expect(teamTemplatesRepository.merge).toHaveBeenCalledWith(teamTemplate, dto);
    expect(teamTemplatesRepository.save).toHaveBeenCalledWith(updatedTeamTemplate);
    expect(result).toEqual(updatedTeamTemplate);
  });

  it('update not found', async () => {
    teamTemplatesRepository.findOne.mockResolvedValue(null);

    await expect(service.update('missing-id', { name: 'Updated' })).rejects.toThrow(
      NotFoundException,
    );
  });

  it('remove success', async () => {
    teamTemplatesRepository.findOne.mockResolvedValue(teamTemplate);
    teamTemplatesRepository.remove.mockResolvedValue(teamTemplate);

    await service.remove(teamTemplate.id);

    expect(teamTemplatesRepository.remove).toHaveBeenCalledWith(teamTemplate);
  });

  it('remove not found', async () => {
    teamTemplatesRepository.findOne.mockResolvedValue(null);

    await expect(service.remove('missing-id')).rejects.toThrow(NotFoundException);
  });
});
