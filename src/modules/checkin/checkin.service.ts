import {
  Injectable,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Checkin, CheckinDocument } from './schemas/checkin.schema';
import { CreateCheckinDto } from './dto/create-checkin.dto';
import { StudentsRepository } from '../students/students.repository';
import { FinanceService } from '../finance/finance.service';
import { StudentStatus } from '../students/schemas/student.schema';
import { PlanDocument } from '../plans/schemas/plan.schema';

export interface CheckinResult {
  authorized: boolean;
  reason?: string;
  checkin?: CheckinDocument;
}

/**
 * Get the ISO week number for a given date
 * ISO weeks start on Monday and the first week contains the first Thursday
 */
function getISOWeekNumber(date: Date): { weekNumber: number; year: number } {
  const d = new Date(
    Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()),
  );
  // Set to nearest Thursday: current date + 4 - current day number, adjusted for Sunday=7
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const weekNumber = Math.ceil(
    ((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7,
  );
  return { weekNumber, year: d.getUTCFullYear() };
}

@Injectable()
export class CheckinService {
  constructor(
    @InjectModel(Checkin.name)
    private readonly checkinModel: Model<CheckinDocument>,
    private readonly studentsRepository: StudentsRepository,
    private readonly financeService: FinanceService,
  ) {}

  /**
   * Register a check-in for a student after validating business rules:
   * 1. Student must exist and be active
   * 2. Student must not have overdue payments
   * 3. Weekly check-in count must be within plan limit
   */
  async create(createCheckinDto: CreateCheckinDto): Promise<CheckinResult> {
    const { studentId } = createCheckinDto;

    try {
      // Rule 1: Verify student exists and is active
      const student = await this.studentsRepository.findById(studentId);

      if (!student) {
        return { authorized: false, reason: 'Student not found' };
      }

      if (student.status !== StudentStatus.ACTIVE) {
        return {
          authorized: false,
          reason: `Student is ${student.status}. Access denied.`,
        };
      }

      // Rule 2: Verify payment is up to date (no overdue finance)
      const hasOverdue = await this.financeService.hasOverdueFinance(studentId);

      if (hasOverdue) {
        return {
          authorized: false,
          reason: 'Payment overdue. Please regularize your situation.',
        };
      }

      // Rule 3: Check weekly check-in limit against plan
      const plan = student.planId as unknown as PlanDocument;

      if (plan && plan.weeklyCheckinLimit) {
        const now = new Date();
        const { weekNumber, year } = getISOWeekNumber(now);

        const weeklyCheckinCount = await this.checkinModel
          .countDocuments({
            studentId: new Types.ObjectId(studentId),
            weekNumber,
            year,
            authorized: true,
          })
          .exec();

        if (weeklyCheckinCount >= plan.weeklyCheckinLimit) {
          return {
            authorized: false,
            reason: `Weekly check-in limit of ${plan.weeklyCheckinLimit} reached.`,
          };
        }
      }

      // All rules passed: save check-in
      const now = new Date();
      const { weekNumber, year } = getISOWeekNumber(now);

      const checkin = new this.checkinModel({
        studentId: new Types.ObjectId(studentId),
        date: now,
        weekNumber,
        year,
        authorized: true,
      });

      const savedCheckin = await checkin.save();

      return { authorized: true, checkin: savedCheckin };
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new HttpException(
        'Error processing check-in',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async findByStudentId(studentId: string): Promise<CheckinDocument[]> {
    try {
      return await this.checkinModel
        .find({ studentId: new Types.ObjectId(studentId) })
        .sort({ date: -1 })
        .exec();
    } catch {
      throw new HttpException(
        'Error fetching check-in history',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
