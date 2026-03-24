import {
  Injectable,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Billing, BillingDocument, BillingStatus } from './schemas/billing.schema';
import { CreateBillingDto } from './dto/create-billing.dto';

@Injectable()
export class BillingService {
  constructor(
    @InjectModel(Billing.name)
    private readonly billingModel: Model<BillingDocument>,
  ) {}

  async findAll(): Promise<BillingDocument[]> {
    try {
      return await this.billingModel
        .find()
        .populate('studentId')
        .sort({ createdAt: -1 })
        .exec();
    } catch {
      throw new HttpException(
        'Error fetching billing records',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Generate a manual billing record for a specific student
   */
  async generate(createBillingDto: CreateBillingDto): Promise<BillingDocument> {
    try {
      const billing = new this.billingModel({
        studentId: new Types.ObjectId(createBillingDto.studentId),
        amount: createBillingDto.amount,
        dueDate: new Date(createBillingDto.dueDate),
        status: BillingStatus.PENDING,
      });
      return await billing.save();
    } catch {
      throw new HttpException(
        'Error generating billing record',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Create billing records in bulk (used by cron jobs)
   */
  async createForStudent(
    studentId: string,
    amount: number,
    dueDate: Date,
  ): Promise<BillingDocument> {
    const billing = new this.billingModel({
      studentId: new Types.ObjectId(studentId),
      amount,
      dueDate,
      status: BillingStatus.PENDING,
    });
    return billing.save();
  }
}
