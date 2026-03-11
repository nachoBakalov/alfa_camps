import { ConflictException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { QueryFailedError } from 'typeorm';
import { Camp } from '../camps/entities/camp.entity';
import { TeamTemplate } from '../team-templates/entities/team-template.entity';
import { CampTypesService } from './camp-types.service';
import { CampType } from './entities/camp-type.entity';

type MockRepository = {
  create: jest.Mock;
  save: jest.Mock;
  find: jest.Mock;
  findOne: jest.Mock;
  count: jest.Mock;
  merge: jest.Mock;
  remove: jest.Mock;
};

const createRepositoryMock = (): MockRepository => ({
  create: jest.fn(),
  save: jest.fn(),
  find: jest.fn(),
  findOne: jest.fn(),
  count: jest.fn(),
  merge: jest.fn(),
  remove: jest.fn(),
});

const createUniqueError = (constraint: string): QueryFailedError =>
  new QueryFailedError('QUERY', [], {
    code: '23505',
    constraint,
  } as unknown as Error);

const createForeignKeyError = (): QueryFailedError =>
  new QueryFailedError('QUERY', [], {
    code: '23503',
  } as unknown as Error);

describe('CampTypesService', () => {
  let service: CampTypesService;
  let campTypesRepository: MockRepository;
  let teamTemplatesRepository: MockRepository;
  let campsRepository: MockRepository;

  const campType: CampType = {
    id: 'camp-type-id',
    name: 'Camp Type',
    slug: 'camp-type',
    description: 'Description',
    logoUrl: '/logo.png',
    coverImageUrl: '/cover.jpg',
    teamTemplates: [],
    camps: [],
    createdAt: new Date('2026-01-01T00:00:00.000Z'),
    updatedAt: new Date('2026-01-01T00:00:00.000Z'),
  };

  beforeEach(async () => {
    campTypesRepository = createRepositoryMock();
    teamTemplatesRepository = createRepositoryMock();
    campsRepository = createRepositoryMock();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CampTypesService,
        {
          provide: getRepositoryToken(CampType),
          useValue: campTypesRepository,
        },
        {
          provide: getRepositoryToken(TeamTemplate),
          useValue: teamTemplatesRepository,
        },
        {
          provide: getRepositoryToken(Camp),
          useValue: campsRepository,
        },
      ],
    }).compile();

    service = module.get<CampTypesService>(CampTypesService);
  });

  it('create() success', async () => {
    campTypesRepository.create.mockReturnValue(campType);
    campTypesRepository.save.mockResolvedValue(campType);

    const result = await service.create({
      name: 'Camp Type',
      slug: 'camp-type',
      description: 'Description',
      logoUrl: '/logo.png',
      coverImageUrl: '/cover.jpg',
    });

    expect(campTypesRepository.create).toHaveBeenCalled();
    expect(campTypesRepository.save).toHaveBeenCalledWith(campType);
    expect(result).toEqual(campType);
  });

  it('create() duplicate name conflict handling', async () => {
    campTypesRepository.create.mockReturnValue(campType);
    campTypesRepository.save.mockRejectedValue(createUniqueError('UQ_camp_types_name'));

    await expect(
      service.create({
        name: 'Camp Type',
        slug: 'camp-type',
      }),
    ).rejects.toThrow(new ConflictException('Camp type name already exists'));
  });

  it('create() duplicate slug conflict handling', async () => {
    campTypesRepository.create.mockReturnValue(campType);
    campTypesRepository.save.mockRejectedValue(createUniqueError('UQ_camp_types_slug'));

    await expect(
      service.create({
        name: 'Camp Type',
        slug: 'camp-type',
      }),
    ).rejects.toThrow(new ConflictException('Camp type slug already exists'));
  });

  it('findAll() returns list', async () => {
    campTypesRepository.find.mockResolvedValue([campType]);

    const result = await service.findAll();

    expect(campTypesRepository.find).toHaveBeenCalledWith({
      order: {
        createdAt: 'DESC',
      },
    });
    expect(result).toEqual([campType]);
  });

  it('findOne() success', async () => {
    campTypesRepository.findOne.mockResolvedValue(campType);

    const result = await service.findOne(campType.id);

    expect(campTypesRepository.findOne).toHaveBeenCalledWith({ where: { id: campType.id } });
    expect(result).toEqual(campType);
  });

  it('findOne() not found', async () => {
    campTypesRepository.findOne.mockResolvedValue(null);

    await expect(service.findOne('missing-id')).rejects.toThrow(NotFoundException);
  });

  it('update() success', async () => {
    const payload = { name: 'Updated Name' };
    const updatedCampType = { ...campType, ...payload };

    campTypesRepository.findOne.mockResolvedValue(campType);
    campTypesRepository.merge.mockReturnValue(updatedCampType);
    campTypesRepository.save.mockResolvedValue(updatedCampType);

    const result = await service.update(campType.id, payload);

    expect(campTypesRepository.merge).toHaveBeenCalledWith(campType, payload);
    expect(campTypesRepository.save).toHaveBeenCalledWith(updatedCampType);
    expect(result).toEqual(updatedCampType);
  });

  it('update() not found', async () => {
    campTypesRepository.findOne.mockResolvedValue(null);

    await expect(service.update('missing-id', { name: 'Updated' })).rejects.toThrow(
      NotFoundException,
    );
  });

  it('update() duplicate unique field conflict handling', async () => {
    campTypesRepository.findOne.mockResolvedValue(campType);
    campTypesRepository.merge.mockReturnValue(campType);
    campTypesRepository.save.mockRejectedValue(createUniqueError('UQ_camp_types_slug'));

    await expect(service.update(campType.id, { slug: 'duplicate' })).rejects.toThrow(
      new ConflictException('Camp type slug already exists'),
    );
  });

  it('remove() success', async () => {
    campTypesRepository.findOne.mockResolvedValue(campType);
    teamTemplatesRepository.count.mockResolvedValue(0);
    campsRepository.count.mockResolvedValue(0);
    campTypesRepository.remove.mockResolvedValue(campType);

    await service.remove(campType.id);

    expect(campTypesRepository.remove).toHaveBeenCalledWith(campType);
  });

  it('remove() not found', async () => {
    campTypesRepository.findOne.mockResolvedValue(null);

    await expect(service.remove('missing-id')).rejects.toThrow(NotFoundException);
  });

  it('remove() with existing team templates returns conflict', async () => {
    campTypesRepository.findOne.mockResolvedValue(campType);
    teamTemplatesRepository.count.mockResolvedValue(1);
    campsRepository.count.mockResolvedValue(0);

    await expect(service.remove(campType.id)).rejects.toThrow(
      new ConflictException('Cannot delete camp type because it is referenced by camps or team templates'),
    );
    expect(campTypesRepository.remove).not.toHaveBeenCalled();
  });

  it('remove() with existing camps returns conflict', async () => {
    campTypesRepository.findOne.mockResolvedValue(campType);
    teamTemplatesRepository.count.mockResolvedValue(0);
    campsRepository.count.mockResolvedValue(2);

    await expect(service.remove(campType.id)).rejects.toThrow(
      new ConflictException('Cannot delete camp type because it is referenced by camps or team templates'),
    );
    expect(campTypesRepository.remove).not.toHaveBeenCalled();
  });

  it('remove() foreign key violation fallback returns conflict', async () => {
    campTypesRepository.findOne.mockResolvedValue(campType);
    teamTemplatesRepository.count.mockResolvedValue(0);
    campsRepository.count.mockResolvedValue(0);
    campTypesRepository.remove.mockRejectedValue(createForeignKeyError());

    await expect(service.remove(campType.id)).rejects.toThrow(
      new ConflictException('Cannot delete camp type because it is referenced by camps or team templates'),
    );
  });
});
