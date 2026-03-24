import {
  Injectable,
  NotFoundException,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Finance, FinanceDocument, FinanceStatus } from './schemas/finance.schema';
import { CreateFinanceDto } from './dto/create-finance.dto';
import { UpdateFinanceDto } from './dto/update-finance.dto';

@Injectable()
export class FinanceService {
  constructor(
    @InjectModel(Finance.name)
    private readonly financeModel: Model<FinanceDocument>,
  ) {}

  async findAll(): Promise<FinanceDocument[]> {
    try {
      return await this.financeModel
        .find()
        .populate('studentId')
        .populate('planId')
        .exec();
    } catch {
      throw new HttpException(
        'Error fetching finances',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async findByStudentId(studentId: string): Promise<FinanceDocument[]> {
    try {
      return await this.financeModel
        .find({ studentId: new Types.ObjectId(studentId) })
        .populate('planId')
        .exec();
    } catch {
      throw new HttpException(
        'Error fetching finances for student',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async create(createFinanceDto: CreateFinanceDto): Promise<FinanceDocument> {
    try {
      const finance = new this.financeModel({
        ...createFinanceDto,
        studentId: new Types.ObjectId(createFinanceDto.studentId),
        planId: new Types.ObjectId(createFinanceDto.planId),
        dueDate: new Date(createFinanceDto.dueDate),
      });
      return await finance.save();
    } catch {
      throw new HttpException(
        'Error creating finance record',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async update(
    id: string,
    updateFinanceDto: UpdateFinanceDto,
  ): Promise<FinanceDocument> {
    try {
      const updateData: Partial<Finance> = {};

      if (updateFinanceDto.status) {
        updateData.status = updateFinanceDto.status;
      }

      if (updateFinanceDto.paidAt) {
        updateData.paidAt = new Date(updateFinanceDto.paidAt);
        // If marking as paid, set status to paid automatically
        if (!updateFinanceDto.status) {
          updateData.status = FinanceStatus.PAID;
        }
      }

      const updated = await this.financeModel
        .findByIdAndUpdate(id, updateData, { new: true })
        .populate('studentId')
        .populate('planId')
        .exec();

      if (!updated) {
        throw new NotFoundException(`Finance record with ID ${id} not found`);
      }

      return updated;
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      throw new HttpException(
        'Error updating finance record',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Check if a student has any overdue finance records
   */
  async hasOverdueFinance(studentId: string): Promise<boolean> {
    const overdueCount = await this.financeModel
      .countDocuments({
        studentId: new Types.ObjectId(studentId),
        status: FinanceStatus.OVERDUE,
      })
      .exec();

    return overdueCount > 0;
  }

  /**
   * Find all pending finance records with due date before today
   */
  async findOverduePending(): Promise<FinanceDocument[]> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return this.financeModel
      .find({
        status: FinanceStatus.PENDING,
        dueDate: { $lt: today },
      })
      .exec();
  }

  /**
   * Update multiple finance records to overdue status
   */
  async markAsOverdue(ids: string[]): Promise<void> {
    await this.financeModel
      .updateMany(
        { _id: { $in: ids.map((id) => new Types.ObjectId(id)) } },
        { status: FinanceStatus.OVERDUE },
      )
      .exec();
  }

  /**
   * Create finance records for billing jobs
   */
  async createForStudent(
    studentId: string,
    planId: string,
    amount: number,
    dueDate: Date,
  ): Promise<FinanceDocument> {
    const finance = new this.financeModel({
      studentId: new Types.ObjectId(studentId),
      planId: new Types.ObjectId(planId),
      amount,
      dueDate,
      status: FinanceStatus.PENDING,
    });
    return finance.save();
  }

  /**
   * Find distinct student IDs with overdue finance records
   */
  async findStudentIdsWithOverdue(): Promise<string[]> {
    const results = await this.financeModel
      .distinct('studentId', { status: FinanceStatus.OVERDUE })
      .exec() as Types.ObjectId[];

    return results.map((id) => id.toString());
  }
}
