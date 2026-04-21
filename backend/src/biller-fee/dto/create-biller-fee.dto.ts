import type { FeeType } from '../entities/biller-fee-history.entity';

export class CreateBillerFeeDto {
  feeType: FeeType;
  feeValue: number;
  effectiveFrom: string;
  note?: string;
  changedBy?: string;
}
