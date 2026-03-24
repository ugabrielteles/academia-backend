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
import { WorkoutsService } from './workouts.service';
import { CreateWorkoutDto } from './dto/create-workout.dto';
import { UpdateWorkoutDto } from './dto/update-workout.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('workouts')
@UseGuards(JwtAuthGuard, RolesGuard)
export class WorkoutsController {
  constructor(private readonly workoutsService: WorkoutsService) {}

  /** GET /workouts - List all workouts */
  @Get()
  @Roles('admin', 'staff')
  async findAll() {
    return this.workoutsService.findAll();
  }

  /** GET /workouts/student/:studentId - List workouts for a specific student */
  @Get('student/:studentId')
  @Roles('admin', 'staff')
  async findByStudent(@Param('studentId') studentId: string) {
    return this.workoutsService.findByStudentId(studentId);
  }

  /** POST /workouts - Create a new workout */
  @Post()
  @Roles('admin', 'staff')
  async create(@Body() createWorkoutDto: CreateWorkoutDto) {
    return this.workoutsService.create(createWorkoutDto);
  }

  /** PUT /workouts/:id - Update a workout */
  @Put(':id')
  @Roles('admin', 'staff')
  async update(
    @Param('id') id: string,
    @Body() updateWorkoutDto: UpdateWorkoutDto,
  ) {
    return this.workoutsService.update(id, updateWorkoutDto);
  }

  /** DELETE /workouts/:id - Delete a workout */
  @Delete(':id')
  @Roles('admin', 'staff')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string): Promise<void> {
    return this.workoutsService.remove(id);
  }
}
