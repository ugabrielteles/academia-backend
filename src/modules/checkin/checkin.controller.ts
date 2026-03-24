import { Controller, Post, Get, Body, Param, UseGuards } from '@nestjs/common';
import { CheckinService, CheckinResult } from './checkin.service';
import { CreateCheckinDto } from './dto/create-checkin.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CheckinDocument } from './schemas/checkin.schema';

@Controller('checkin')
@UseGuards(JwtAuthGuard, RolesGuard)
export class CheckinController {
  constructor(private readonly checkinService: CheckinService) {}

  /**
   * POST /checkin - Register a check-in
   * Validates student status, payment, and weekly limit
   */
  @Post()
  @Roles('admin', 'staff')
  async create(@Body() createCheckinDto: CreateCheckinDto): Promise<CheckinResult> {
    return this.checkinService.create(createCheckinDto);
  }

  /** GET /checkin/student/:studentId - Get check-in history for a student */
  @Get('student/:studentId')
  @Roles('admin', 'staff')
  async findByStudent(@Param('studentId') studentId: string): Promise<CheckinDocument[]> {
    return this.checkinService.findByStudentId(studentId);
  }
}
