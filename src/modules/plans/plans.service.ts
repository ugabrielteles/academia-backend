import {
  Injectable,
  NotFoundException,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Plan, PlanDocument } from './schemas/plan.schema';
import { CreatePlanDto } from './dto/create-plan.dto';
import { UpdatePlanDto } from './dto/update-plan.dto';

@Injectable()
export class PlansService {
  constructor(
    @InjectModel(Plan.name)
    private readonly planModel: Model<PlanDocument>,
  ) {}

  async findAll(): Promise<PlanDocument[]> {
    try {
      return await this.planModel.find().exec();
    } catch {
      throw new HttpException(
        'Error fetching plans',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async findById(id: string): Promise<PlanDocument> {
    try {
      const plan = await this.planModel.findById(id).exec();

      if (!plan) {
        throw new NotFoundException(`Plan with ID ${id} not found`);
      }

      return plan;
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      throw new HttpException(
        'Error fetching plan',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async create(createPlanDto: CreatePlanDto): Promise<PlanDocument> {
    try {
      const plan = new this.planModel(createPlanDto);
      return await plan.save();
    } catch {
      throw new HttpException(
        'Error creating plan',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async update(
    id: string,
    updatePlanDto: UpdatePlanDto,
  ): Promise<PlanDocument> {
    try {
      const updated = await this.planModel
        .findByIdAndUpdate(id, updatePlanDto, { new: true })
        .exec();

      if (!updated) {
        throw new NotFoundException(`Plan with ID ${id} not found`);
      }

      return updated;
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      throw new HttpException(
        'Error updating plan',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async remove(id: string): Promise<void> {
    try {
      const deleted = await this.planModel.findByIdAndDelete(id).exec();

      if (!deleted) {
        throw new NotFoundException(`Plan with ID ${id} not found`);
      }
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      throw new HttpException(
        'Error deleting plan',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
