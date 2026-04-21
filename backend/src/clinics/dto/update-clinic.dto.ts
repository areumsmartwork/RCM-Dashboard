import type { ServiceType, EmrLink } from '../entities/clinic.entity';

export class UpdateClinicDto {
  name?: string;
  state?: string;
  timezone?: string;
  phone?: string;
  address?: string;
  contactName?: string;
  ein?: string;
  npi?: string;
  taxonomyCode?: string;
  posCode?: string;
  acceptAssignment?: boolean;
  serviceTypes?: ServiceType[];
  emrLinks?: EmrLink[];
  sortOrder?: number;
  isActive?: boolean;
}
