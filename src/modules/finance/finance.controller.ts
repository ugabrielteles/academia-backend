import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { FinanceService } from './finance.service';
import { CreateFinanceDto } from './dto/create-finance.dto';
import { UpdateFinanceDto } from './dto/update-finance.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('finance')
@UseGuards(JwtAuthGuard, RolesGuard)
export class FinanceController {
  constructor(private readonly financeService: FinanceService) {}

  /** GET /finance - List all finance records */
  @Get()
  @Roles('admin', 'staff')
  async findAll() {
    return this.financeService.findAll();
  }

  /** GET /finance/student/:studentId - List finance records for a student */
  @Get('student/:studentId')
  @Roles('admin', 'staff')
  async findByStudent(@Param('studentId') studentId: string) {
    return this.financeService.findByStudentId(studentId);
  }

  /** POST /finance - Create a finance record */
  @Post()
  @Roles('admin', 'staff')
  async create(@Body() createFinanceDto: CreateFinanceDto) {
    return this.financeService.create(createFinanceDto);
  }

  /** PUT /finance/:id - Update a finance record (e.g., mark as paid) */
  @Put(':id')
  @Roles('admin', 'staff')
  async update(
    @Param('id') id: string,
    @Body() updateFinanceDto: UpdateFinanceDto,
  ) {
    return this.financeService.update(id, updateFinanceDto);
  }
}
