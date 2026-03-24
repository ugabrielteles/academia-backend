import {
  Controller,
  Get,
  Post,
  Body,
  UseGuards,
} from '@nestjs/common';
import { BillingService } from './billing.service';
import { CreateBillingDto } from './dto/create-billing.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('billing')
@UseGuards(JwtAuthGuard, RolesGuard)
export class BillingController {
  constructor(private readonly billingService: BillingService) {}

  /** GET /billing - List all billing records */
  @Get()
  @Roles('admin', 'staff')
  async findAll() {
    return this.billingService.findAll();
  }

  /** POST /billing/generate - Generate a manual billing for a student */
  @Post('generate')
  @Roles('admin')
  async generate(@Body() createBillingDto: CreateBillingDto) {
    return this.billingService.generate(createBillingDto);
  }
}
