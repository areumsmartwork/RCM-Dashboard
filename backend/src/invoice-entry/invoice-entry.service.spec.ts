import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotFoundException } from '@nestjs/common';
import { InvoiceEntryService } from './invoice-entry.service';
import { InvoiceEntry } from './entities/invoice-entry.entity';

const mockEntry = (): InvoiceEntry =>
  ({
    id: 'entry-1',
    clinicId: 'clinic-1',
    billingYear: 2025,
    billingMonth: 3,
    rpmInvoice: 1000,
    ccmInvoice: 500,
    rpmPts: 10,
    ccmPts: 5,
    ciAmount: null,
    ciDate: null,
    ciMethod: null,
    ciReference: null,
    ciRemark: null,
    status: 'unpaid',
  }) as InvoiceEntry;

describe('InvoiceEntryService', () => {
  let service: InvoiceEntryService;

  const mockRepo = {
    find: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        InvoiceEntryService,
        { provide: getRepositoryToken(InvoiceEntry), useValue: mockRepo },
      ],
    }).compile();

    service = module.get<InvoiceEntryService>(InvoiceEntryService);
    jest.clearAllMocks();
  });

  describe('findByClinic', () => {
    it('returns entries ordered by year/month desc', async () => {
      const entries = [mockEntry()];
      mockRepo.find.mockResolvedValue(entries);

      const result = await service.findByClinic('clinic-1');

      expect(mockRepo.find).toHaveBeenCalledWith({
        where: { clinicId: 'clinic-1' },
        order: { billingYear: 'DESC', billingMonth: 'DESC' },
      });
      expect(result).toBe(entries);
    });
  });

  describe('findOne', () => {
    it('returns entry when found', async () => {
      const entry = mockEntry();
      mockRepo.findOne.mockResolvedValue(entry);

      const result = await service.findOne('clinic-1', 2025, 3);

      expect(mockRepo.findOne).toHaveBeenCalledWith({
        where: { clinicId: 'clinic-1', billingYear: 2025, billingMonth: 3 },
      });
      expect(result).toBe(entry);
    });

    it('returns null when not found', async () => {
      mockRepo.findOne.mockResolvedValue(null);
      const result = await service.findOne('clinic-1', 2025, 99);
      expect(result).toBeNull();
    });
  });

  describe('saveInvoice', () => {
    it('updates existing entry', async () => {
      const existing = mockEntry();
      mockRepo.findOne.mockResolvedValue(existing);
      mockRepo.save.mockResolvedValue({ ...existing, rpmInvoice: 2000 });

      const result = await service.saveInvoice({
        clinicId: 'clinic-1',
        billingYear: 2025,
        billingMonth: 3,
        rpmInvoice: 2000,
      });

      expect(mockRepo.save).toHaveBeenCalled();
      expect(result.rpmInvoice).toBe(2000);
    });

    it('creates new entry when none exists', async () => {
      mockRepo.findOne.mockResolvedValue(null);
      const created = mockEntry();
      mockRepo.create.mockReturnValue(created);
      mockRepo.save.mockResolvedValue(created);

      await service.saveInvoice({
        clinicId: 'clinic-1',
        billingYear: 2025,
        billingMonth: 4,
        rpmInvoice: 1500,
        ccmInvoice: null,
        rpmPts: 15,
        ccmPts: null,
      });

      expect(mockRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({ clinicId: 'clinic-1', billingYear: 2025, billingMonth: 4, status: 'unpaid' }),
      );
      expect(mockRepo.save).toHaveBeenCalled();
    });
  });

  describe('saveCi', () => {
    it('updates CI fields on existing entry', async () => {
      const entry = mockEntry();
      mockRepo.findOne.mockResolvedValue(entry);
      mockRepo.save.mockResolvedValue({ ...entry, ciAmount: 750, status: 'paid' });

      const result = await service.saveCi('entry-1', {
        ciAmount: 750,
        ciDate: '2025-03-15',
        ciMethod: 'ACH',
        status: 'paid',
      });

      expect(mockRepo.save).toHaveBeenCalled();
      expect(result.ciAmount).toBe(750);
      expect(result.status).toBe('paid');
    });

    it('throws NotFoundException when entry not found', async () => {
      mockRepo.findOne.mockResolvedValue(null);
      await expect(service.saveCi('missing-id', { ciAmount: 100 })).rejects.toThrow(NotFoundException);
    });
  });

  describe('updateStatus', () => {
    it('toggles status to paid', async () => {
      const entry = mockEntry();
      mockRepo.findOne.mockResolvedValue(entry);
      mockRepo.save.mockResolvedValue({ ...entry, status: 'paid' });

      const result = await service.updateStatus('entry-1', 'paid');
      expect(result.status).toBe('paid');
    });

    it('throws NotFoundException when entry not found', async () => {
      mockRepo.findOne.mockResolvedValue(null);
      await expect(service.updateStatus('missing-id', 'paid')).rejects.toThrow(NotFoundException);
    });
  });
});
