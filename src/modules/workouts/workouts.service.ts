import {
  Injectable,
  NotFoundException,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Workout, WorkoutDocument } from './schemas/workout.schema';
import { CreateWorkoutDto } from './dto/create-workout.dto';

@Injectable()
export class WorkoutsService {
  constructor(
    @InjectModel(Workout.name)
    private readonly workoutModel: Model<WorkoutDocument>,
  ) {}

  async findAll(): Promise<WorkoutDocument[]> {
    try {
      return await this.workoutModel.find().populate('studentId').exec();
    } catch {
      throw new HttpException(
        'Error fetching workouts',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async findByStudentId(studentId: string): Promise<WorkoutDocument[]> {
    try {
      return await this.workoutModel
        .find({ studentId: new Types.ObjectId(studentId) })
        .populate('studentId')
        .exec();
    } catch {
      throw new HttpException(
        'Error fetching workouts for student',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async create(createWorkoutDto: CreateWorkoutDto): Promise<WorkoutDocument> {
    try {
      const workout = new this.workoutModel({
        ...createWorkoutDto,
        studentId: new Types.ObjectId(createWorkoutDto.studentId),
      });
      return await workout.save();
    } catch {
      throw new HttpException(
        'Error creating workout',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async update(
    id: string,
    updateWorkoutDto: Partial<CreateWorkoutDto>,
  ): Promise<WorkoutDocument> {
    try {
      const updateData: Record<string, unknown> = { ...updateWorkoutDto };

      if (updateWorkoutDto.studentId) {
        updateData['studentId'] = new Types.ObjectId(updateWorkoutDto.studentId);
      }

      const updated = await this.workoutModel
        .findByIdAndUpdate(id, updateData, { new: true })
        .populate('studentId')
        .exec();

      if (!updated) {
        throw new NotFoundException(`Workout with ID ${id} not found`);
      }

      return updated;
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      throw new HttpException(
        'Error updating workout',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async remove(id: string): Promise<void> {
    try {
      const deleted = await this.workoutModel.findByIdAndDelete(id).exec();

      if (!deleted) {
        throw new NotFoundException(`Workout with ID ${id} not found`);
      }
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      throw new HttpException(
        'Error deleting workout',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
