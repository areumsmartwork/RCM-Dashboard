import { Controller, Get, Patch, Param, Body } from '@nestjs/common';
import { ClinicsService } from './clinics.service';
import { Clinic } from './entities/clinic.entity';
import { UpdateClinicDto } from './dto/update-clinic.dto';

@Controller('clinics')
export class ClinicsController {
  constructor(private readonly service: ClinicsService) {}

  @Get()
  findAll(): Promise<Clinic[]> {
    return this.service.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string): Promise<Clinic> {
    return this.service.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() body: UpdateClinicDto,
  ): Promise<Clinic> {
    return this.service.update(id, body);
  }

  @Patch(':id/sync')
  sync(@Param('id') id: string): Promise<void> {
    return this.service.updateSyncTime(id);
  }
}
