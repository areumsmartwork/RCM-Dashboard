import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { InvoiceEntry, EntryStatus } from './entities/invoice-entry.entity';
import { SaveInvoiceDto } from './dto/save-invoice.dto';
import { SaveCiDto } from './dto/save-ci.dto';

@Injectable()
export class InvoiceEntryService {
  constructor(
    @InjectRepository(InvoiceEntry)
    private readonly repo: Repository<InvoiceEntry>,
  ) {}

  /** 클리닉의 전체 입력 내역 (최신순) */
  findByClinic(clinicId: string): Promise<InvoiceEntry[]> {
    return this.repo.find({
      where: { clinicId },
      order: { billingYear: 'DESC', billingMonth: 'DESC' },
    });
  }

  /** 특정 월 단건 조회 — 없으면 null */
  findOne(
    clinicId: string,
    year: number,
    month: number,
  ): Promise<InvoiceEntry | null> {
    return this.repo.findOne({
      where: { clinicId, billingYear: year, billingMonth: month },
    });
  }

  /**
   * Invoice 저장 (upsert)
   * 해당 월 레코드가 없으면 생성, 있으면 인보이스 필드만 업데이트
   */
  async saveInvoice(dto: SaveInvoiceDto): Promise<InvoiceEntry> {
    const existing = await this.findOne(
      dto.clinicId,
      dto.billingYear,
      dto.billingMonth,
    );

    if (existing) {
      Object.assign(existing, {
        rpmInvoice: dto.rpmInvoice ?? existing.rpmInvoice,
        ccmInvoice: dto.ccmInvoice ?? existing.ccmInvoice,
        rpmPts: dto.rpmPts ?? existing.rpmPts,
        ccmPts: dto.ccmPts ?? existing.ccmPts,
      });
      return this.repo.save(existing);
    }

    return this.repo.save(
      this.repo.create({
        clinicId: dto.clinicId,
        billingYear: dto.billingYear,
        billingMonth: dto.billingMonth,
        rpmInvoice: dto.rpmInvoice ?? null,
        ccmInvoice: dto.ccmInvoice ?? null,
        rpmPts: dto.rpmPts ?? null,
        ccmPts: dto.ccmPts ?? null,
        status: 'unpaid',
      }),
    );
  }

  /**
   * CI (HicareNet 입금) 저장
   * 반드시 invoice가 먼저 저장된 상태여야 함
   */
  async saveCi(id: string, dto: SaveCiDto): Promise<InvoiceEntry> {
    const entry = await this.repo.findOne({ where: { id } });
    if (!entry) throw new NotFoundException(`InvoiceEntry ${id} not found`);

    Object.assign(entry, {
      ciAmount: dto.ciAmount ?? entry.ciAmount,
      ciDate: dto.ciDate ?? entry.ciDate,
      ciMethod: dto.ciMethod ?? entry.ciMethod,
      ciReference: dto.ciReference ?? entry.ciReference,
      ciRemark: dto.ciRemark ?? entry.ciRemark,
      status: dto.status ?? entry.status,
    });

    return this.repo.save(entry);
  }

  /** 상태만 변경 (paid / unpaid) */
  async updateStatus(id: string, status: EntryStatus): Promise<InvoiceEntry> {
    const entry = await this.repo.findOne({ where: { id } });
    if (!entry) throw new NotFoundException(`InvoiceEntry ${id} not found`);
    entry.status = status;
    return this.repo.save(entry);
  }
}
