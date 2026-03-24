import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { StudentsService } from './students.service';
import { CreateStudentDto } from './dto/create-student.dto';
import { UpdateStudentDto } from './dto/update-student.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('students')
@UseGuards(JwtAuthGuard, RolesGuard)
export class StudentsController {
  constructor(private readonly studentsService: StudentsService) {}

  /** GET /students - List all students */
  @Get()
  @Roles('admin', 'staff')
  async findAll() {
    return this.studentsService.findAll();
  }

  /** GET /students/:id - Get a specific student */
  @Get(':id')
  @Roles('admin', 'staff')
  async findOne(@Param('id') id: string) {
    return this.studentsService.findById(id);
  }

  /** POST /students - Create a new student */
  @Post()
  @Roles('admin', 'staff')
  async create(@Body() createStudentDto: CreateStudentDto) {
    return this.studentsService.create(createStudentDto);
  }

  /** PUT /students/:id - Update a student */
  @Put(':id')
  @Roles('admin', 'staff')
  async update(
    @Param('id') id: string,
    @Body() updateStudentDto: UpdateStudentDto,
  ) {
    return this.studentsService.update(id, updateStudentDto);
  }

  /** DELETE /students/:id - Delete a student */
  @Delete(':id')
  @Roles('admin')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string): Promise<void> {
    return this.studentsService.remove(id);
  }
}
