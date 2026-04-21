import { Controller, Get, Post, Param, Body } from '@nestjs/common';
import { BillerFeeService } from './biller-fee.service';
import { BillerFeeHistory } from './entities/biller-fee-history.entity';
import { CreateBillerFeeDto } from './dto/create-biller-fee.dto';

@Controller('clinics/:clinicId/biller-fee')
export class BillerFeeController {
  constructor(private readonly service: BillerFeeService) {}

  @Get()
  findAll(@Param('clinicId') clinicId: string): Promise<BillerFeeHistory[]> {
    return this.service.findByClinic(clinicId);
  }

  @Post()
  create(
    @Param('clinicId') clinicId: string,
    @Body() body: CreateBillerFeeDto,
  ): Promise<BillerFeeHistory> {
    return this.service.create(clinicId, body);
  }
}
