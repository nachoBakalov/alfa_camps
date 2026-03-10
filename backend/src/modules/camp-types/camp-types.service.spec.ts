import { ConflictException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { QueryFailedError } from 'typeorm';
import { CampTypesService } from './camp-types.service';
import { CampType } from './entities/camp-type.entity';

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

const createUniqueError = (constraint: string): QueryFailedError =>
  new QueryFailedError('QUERY', [], {
    code: '23505',
    constraint,
  } as unknown as Error);

describe('CampTypesService', () => {
  let service: CampTypesService;
  let repository: MockRepository;

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
    repository = createRepositoryMock();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CampTypesService,
        {
          provide: getRepositoryToken(CampType),
          useValue: repository,
        },
      ],
    }).compile();

    service = module.get<CampTypesService>(CampTypesService);
  });

  it('create() success', async () => {
    repository.create.mockReturnValue(campType);
    repository.save.mockResolvedValue(campType);

    const result = await service.create({
      name: 'Camp Type',
      slug: 'camp-type',
      description: 'Description',
      logoUrl: '/logo.png',
      coverImageUrl: '/cover.jpg',
    });

    expect(repository.create).toHaveBeenCalled();
    expect(repository.save).toHaveBeenCalledWith(campType);
    expect(result).toEqual(campType);
  });

  it('create() duplicate name conflict handling', async () => {
    repository.create.mockReturnValue(campType);
    repository.save.mockRejectedValue(createUniqueError('UQ_camp_types_name'));

    await expect(
      service.create({
        name: 'Camp Type',
        slug: 'camp-type',
      }),
    ).rejects.toThrow(new ConflictException('Camp type name already exists'));
  });

  it('create() duplicate slug conflict handling', async () => {
    repository.create.mockReturnValue(campType);
    repository.save.mockRejectedValue(createUniqueError('UQ_camp_types_slug'));

    await expect(
      service.create({
        name: 'Camp Type',
        slug: 'camp-type',
      }),
    ).rejects.toThrow(new ConflictException('Camp type slug already exists'));
  });

  it('findAll() returns list', async () => {
    repository.find.mockResolvedValue([campType]);

    const result = await service.findAll();

    expect(repository.find).toHaveBeenCalledWith({
      order: {
        createdAt: 'DESC',
      },
    });
    expect(result).toEqual([campType]);
  });

  it('findOne() success', async () => {
    repository.findOne.mockResolvedValue(campType);

    const result = await service.findOne(campType.id);

    expect(repository.findOne).toHaveBeenCalledWith({ where: { id: campType.id } });
    expect(result).toEqual(campType);
  });

  it('findOne() not found', async () => {
    repository.findOne.mockResolvedValue(null);

    await expect(service.findOne('missing-id')).rejects.toThrow(NotFoundException);
  });

  it('update() success', async () => {
    const payload = { name: 'Updated Name' };
    const updatedCampType = { ...campType, ...payload };

    repository.findOne.mockResolvedValue(campType);
    repository.merge.mockReturnValue(updatedCampType);
    repository.save.mockResolvedValue(updatedCampType);

    const result = await service.update(campType.id, payload);

    expect(repository.merge).toHaveBeenCalledWith(campType, payload);
    expect(repository.save).toHaveBeenCalledWith(updatedCampType);
    expect(result).toEqual(updatedCampType);
  });

  it('update() not found', async () => {
    repository.findOne.mockResolvedValue(null);

    await expect(service.update('missing-id', { name: 'Updated' })).rejects.toThrow(
      NotFoundException,
    );
  });

  it('update() duplicate unique field conflict handling', async () => {
    repository.findOne.mockResolvedValue(campType);
    repository.merge.mockReturnValue(campType);
    repository.save.mockRejectedValue(createUniqueError('UQ_camp_types_slug'));

    await expect(service.update(campType.id, { slug: 'duplicate' })).rejects.toThrow(
      new ConflictException('Camp type slug already exists'),
    );
  });

  it('remove() success', async () => {
    repository.findOne.mockResolvedValue(campType);
    repository.remove.mockResolvedValue(campType);

    await service.remove(campType.id);

    expect(repository.remove).toHaveBeenCalledWith(campType);
  });

  it('remove() not found', async () => {
    repository.findOne.mockResolvedValue(null);

    await expect(service.remove('missing-id')).rejects.toThrow(NotFoundException);
  });
});
