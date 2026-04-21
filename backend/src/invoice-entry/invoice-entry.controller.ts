import { Controller, Get, Post, Patch, Param, Body } from '@nestjs/common';
import { InvoiceEntryService } from './invoice-entry.service';
import { SaveInvoiceDto } from './dto/save-invoice.dto';
import { SaveCiDto } from './dto/save-ci.dto';
import type { EntryStatus } from './entities/invoice-entry.entity';

@Controller('invoice-entries')
export class InvoiceEntryController {
  constructor(private readonly service: InvoiceEntryService) {}

  /** GET /invoice-entries/clinic/:clinicId */
  @Get('clinic/:clinicId')
  findByClinic(@Param('clinicId') clinicId: string) {
    return this.service.findByClinic(clinicId);
  }

  /** GET /invoice-entries/clinic/:clinicId/:year/:month */
  @Get('clinic/:clinicId/:year/:month')
  findOne(
    @Param('clinicId') clinicId: string,
    @Param('year') year: string,
    @Param('month') month: string,
  ) {
    return this.service.findOne(clinicId, +year, +month);
  }

  /** POST /invoice-entries — Invoice 저장 (upsert) */
  @Post()
  saveInvoice(@Body() dto: SaveInvoiceDto) {
    return this.service.saveInvoice(dto);
  }

  /** PATCH /invoice-entries/:id/ci — CI 입금 저장 */
  @Patch(':id/ci')
  saveCi(@Param('id') id: string, @Body() dto: SaveCiDto) {
    return this.service.saveCi(id, dto);
  }

  /** PATCH /invoice-entries/:id/status */
  @Patch(':id/status')
  updateStatus(@Param('id') id: string, @Body('status') status: EntryStatus) {
    return this.service.updateStatus(id, status);
  }
}
