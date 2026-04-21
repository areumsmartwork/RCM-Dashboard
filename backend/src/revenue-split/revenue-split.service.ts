import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RevenueSplitHistory } from './entities/revenue-split-history.entity';
import { ServiceType } from '../clinics/entities/clinic.entity';
import { CreateRevenueSplitDto } from './dto/create-revenue-split.dto';

@Injectable()
export class RevenueSplitService {
  constructor(
    @InjectRepository(RevenueSplitHistory)
    private readonly repo: Repository<RevenueSplitHistory>,
  ) {}

  findByClinic(clinicId: string): Promise<RevenueSplitHistory[]> {
    return this.repo.find({
      where: { clinicId },
      order: { effectiveFrom: 'DESC' },
    });
  }

  findByClinicAndType(
    clinicId: string,
    serviceType: ServiceType,
  ): Promise<RevenueSplitHistory[]> {
    return this.repo.find({
      where: { clinicId, serviceType },
      order: { effectiveFrom: 'DESC' },
    });
  }

  create(clinicId: string, dto: CreateRevenueSplitDto): Promise<RevenueSplitHistory> {
    return this.repo.save(this.repo.create({ ...dto, clinicId }));
  }
}
