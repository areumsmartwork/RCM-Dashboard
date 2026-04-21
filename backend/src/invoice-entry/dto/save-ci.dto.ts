import type { CiMethod, EntryStatus } from '../entities/invoice-entry.entity';

export class SaveCiDto {
  ciAmount?: number | null;
  ciDate?: string | null;
  ciMethod?: CiMethod | null;
  ciReference?: string | null;
  ciRemark?: string | null;
  status?: EntryStatus;
}
