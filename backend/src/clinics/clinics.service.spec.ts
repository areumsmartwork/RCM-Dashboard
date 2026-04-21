import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotFoundException } from '@nestjs/common';
import { ClinicsService } from './clinics.service';
import { Clinic } from './entities/clinic.entity';

const mockClinic = (): Clinic =>
  ({
    id: 'clinic-1',
    name: 'Test Clinic',
    code: 'TST',
    state: 'CA',
    timezone: 'America/Los_Angeles',
    phone: null,
    address: null,
    contactName: null,
    ein: null,
    npi: null,
    taxonomyCode: null,
    posCode: null,
    acceptAssignment: true,
    serviceTypes: ['RPM'],
    emrLinks: [],
    sortOrder: 0,
    isActive: true,
    lastSyncedAt: null,
    createdAt: new Date(),
    revenueSplitHistory: [],
    billerFeeHistory: [],
    invoiceEntries: [],
  }) as unknown as Clinic;

describe('ClinicsService', () => {
  let service: ClinicsService;

  const mockRepo = {
    find: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    update: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ClinicsService,
        { provide: getRepositoryToken(Clinic), useValue: mockRepo },
      ],
    }).compile();

    service = module.get<ClinicsService>(ClinicsService);
    jest.clearAllMocks();
  });

  describe('findAll', () => {
    it('returns clinics ordered by sortOrder then name', async () => {
      const clinics = [mockClinic()];
      mockRepo.find.mockResolvedValue(clinics);

      const result = await service.findAll();

      expect(mockRepo.find).toHaveBeenCalledWith({
        order: { sortOrder: 'ASC', name: 'ASC' },
      });
      expect(result).toBe(clinics);
    });
  });

  describe('findOne', () => {
    it('returns clinic with relations', async () => {
      const clinic = mockClinic();
      mockRepo.findOne.mockResolvedValue(clinic);

      const result = await service.findOne('clinic-1');

      expect(mockRepo.findOne).toHaveBeenCalledWith({
        where: { id: 'clinic-1' },
        relations: ['revenueSplitHistory', 'billerFeeHistory'],
      });
      expect(result).toBe(clinic);
    });

    it('throws NotFoundException when clinic not found', async () => {
      mockRepo.findOne.mockResolvedValue(null);
      await expect(service.findOne('missing-id')).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('updates and returns refreshed clinic', async () => {
      const clinic = mockClinic();
      mockRepo.update.mockResolvedValue({ affected: 1 });
      mockRepo.findOne.mockResolvedValue({ ...clinic, name: 'Updated Clinic' });

      const result = await service.update('clinic-1', { name: 'Updated Clinic' });

      expect(mockRepo.update).toHaveBeenCalledWith('clinic-1', { name: 'Updated Clinic' });
      expect(result.name).toBe('Updated Clinic');
    });

    it('throws NotFoundException when clinic not found after update', async () => {
      mockRepo.update.mockResolvedValue({ affected: 0 });
      mockRepo.findOne.mockResolvedValue(null);

      await expect(service.update('missing-id', { name: 'X' })).rejects.toThrow(NotFoundException);
    });
  });

  describe('updateSyncTime', () => {
    it('calls update with current timestamp', async () => {
      mockRepo.update.mockResolvedValue({ affected: 1 });

      await service.updateSyncTime('clinic-1');

      expect(mockRepo.update).toHaveBeenCalledWith(
        'clinic-1',
        expect.objectContaining({ lastSyncedAt: expect.any(Date) }),
      );
    });
  });
});
