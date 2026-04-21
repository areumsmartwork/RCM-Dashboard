import type { ServiceType } from '../../clinics/entities/clinic.entity';

export class CreateRevenueSplitDto {
  serviceType: ServiceType;
  clinicPct: number;
  hicarePct: number;
  effectiveFrom: string;
  changedBy?: string;
}
