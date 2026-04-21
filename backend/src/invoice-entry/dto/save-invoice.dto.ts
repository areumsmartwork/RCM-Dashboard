// NOTE: add class-validator decorators after `npm i class-validator class-transformer`
// and enable ValidationPipe in main.ts.
//
// Example:
//   @IsUUID()        clinicId: string
//   @IsInt()         billingYear: number
//   @IsOptional() @IsNumber() rpmInvoice?: number | null

export class SaveInvoiceDto {
  clinicId: string;
  billingYear: number;
  billingMonth: number;
  rpmInvoice?: number | null;
  ccmInvoice?: number | null;
  rpmPts?: number | null;
  ccmPts?: number | null;
}
