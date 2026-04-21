import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BillerFeeHistory } from './entities/biller-fee-history.entity';
import { CreateBillerFeeDto } from './dto/create-biller-fee.dto';

@Injectable()
export class BillerFeeService {
  constructor(
    @InjectRepository(BillerFeeHistory)
    private readonly repo: Repository<BillerFeeHistory>,
  ) {}

  findByClinic(clinicId: string): Promise<BillerFeeHistory[]> {
    return this.repo.find({
      where: { clinicId },
      order: { effectiveFrom: 'DESC' },
    });
  }

  create(clinicId: string, dto: CreateBillerFeeDto): Promise<BillerFeeHistory> {
    return this.repo.save(this.repo.create({ ...dto, clinicId }));
  }
}
