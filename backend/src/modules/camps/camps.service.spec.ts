import { ConflictException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { QueryFailedError } from 'typeorm';
import { CampType } from '../camp-types/entities/camp-type.entity';
import { Camp } from './entities/camp.entity';
import { CampStatus } from './enums/camp-status.enum';
import { CampsService } from './camps.service';

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
    constraint: 'UQ_camps_camp_type_year_title',
  } as unknown as Error);

describe('CampsService', () => {
  let service: CampsService;
  let campsRepository: MockRepository;
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
    camps: [],
  };

  const camp: Camp = {
    id: 'camp-id',
    campTypeId,
    campType,
    title: 'Summer Camp',
    year: 2026,
    startDate: '2026-07-01',
    endDate: '2026-07-10',
    location: 'Sofia',
    description: 'Camp description',
    logoUrl: '/logo.png',
    coverImageUrl: '/cover.jpg',
    status: CampStatus.DRAFT,
    createdBy: 'user-id',
    createdByUser: null,
    finalizedAt: null,
    createdAt: new Date('2026-01-01T00:00:00.000Z'),
    updatedAt: new Date('2026-01-01T00:00:00.000Z'),
  };

  beforeEach(async () => {
    campsRepository = createRepositoryMock();
    campTypesRepository = createRepositoryMock();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CampsService,
        {
          provide: getRepositoryToken(Camp),
          useValue: campsRepository,
        },
        {
          provide: getRepositoryToken(CampType),
          useValue: campTypesRepository,
        },
      ],
    }).compile();

    service = module.get<CampsService>(CampsService);
  });

  it('create success', async () => {
    campTypesRepository.findOne.mockResolvedValue(campType);
    campsRepository.create.mockReturnValue(camp);
    campsRepository.save.mockResolvedValue(camp);

    const result = await service.create(
      {
        campTypeId,
        title: 'Summer Camp',
        year: 2026,
        startDate: '2026-07-01',
        endDate: '2026-07-10',
        location: 'Sofia',
        description: 'Camp description',
        logoUrl: '/logo.png',
        coverImageUrl: '/cover.jpg',
      },
      'user-id',
    );

    expect(campTypesRepository.findOne).toHaveBeenCalledWith({ where: { id: campTypeId } });
    expect(campsRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({ status: CampStatus.DRAFT, createdBy: 'user-id' }),
    );
    expect(result).toEqual(camp);
  });

  it('create with missing camp type -> not found', async () => {
    campTypesRepository.findOne.mockResolvedValue(null);

    await expect(
      service.create(
        {
          campTypeId,
          title: 'Summer Camp',
          year: 2026,
          startDate: '2026-07-01',
          endDate: '2026-07-10',
        },
        null,
      ),
    ).rejects.toThrow(new NotFoundException(`Camp type with id ${campTypeId} was not found`));
  });

  it('create duplicate unique key -> conflict', async () => {
    campTypesRepository.findOne.mockResolvedValue(campType);
    campsRepository.create.mockReturnValue(camp);
    campsRepository.save.mockRejectedValue(createUniqueError());

    await expect(
      service.create(
        {
          campTypeId,
          title: 'Summer Camp',
          year: 2026,
          startDate: '2026-07-01',
          endDate: '2026-07-10',
        },
        null,
      ),
    ).rejects.toThrow(
      new ConflictException('Camp with this camp type, year and title already exists'),
    );
  });

  it('findAll', async () => {
    campsRepository.find.mockResolvedValue([camp]);

    const result = await service.findAll();

    expect(campsRepository.find).toHaveBeenCalledWith({
      order: {
        createdAt: 'DESC',
      },
    });
    expect(result).toEqual([camp]);
  });

  it('findOne success', async () => {
    campsRepository.findOne.mockResolvedValue(camp);

    const result = await service.findOne(camp.id);

    expect(campsRepository.findOne).toHaveBeenCalledWith({ where: { id: camp.id } });
    expect(result).toEqual(camp);
  });

  it('findOne not found', async () => {
    campsRepository.findOne.mockResolvedValue(null);

    await expect(service.findOne('missing-id')).rejects.toThrow(NotFoundException);
  });

  it('update success', async () => {
    const dto = { title: 'Updated Camp', status: CampStatus.ACTIVE };
    const updatedCamp = { ...camp, ...dto };

    campsRepository.findOne.mockResolvedValue(camp);
    campsRepository.merge.mockReturnValue(updatedCamp);
    campsRepository.save.mockResolvedValue(updatedCamp);

    const result = await service.update(camp.id, dto);

    expect(campsRepository.merge).toHaveBeenCalledWith(camp, dto);
    expect(campsRepository.save).toHaveBeenCalledWith(updatedCamp);
    expect(result).toEqual(updatedCamp);
  });

  it('update not found', async () => {
    campsRepository.findOne.mockResolvedValue(null);

    await expect(service.update('missing-id', { title: 'Updated' })).rejects.toThrow(
      NotFoundException,
    );
  });

  it('remove success', async () => {
    campsRepository.findOne.mockResolvedValue(camp);
    campsRepository.remove.mockResolvedValue(camp);

    await service.remove(camp.id);

    expect(campsRepository.remove).toHaveBeenCalledWith(camp);
  });

  it('remove not found', async () => {
    campsRepository.findOne.mockResolvedValue(null);

    await expect(service.remove('missing-id')).rejects.toThrow(NotFoundException);
  });
});
