import {
  Injectable,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import {
  TurnstileLog,
  TurnstileLogDocument,
} from './schemas/turnstile-log.schema';
import { AuthorizeTurnstileDto } from './dto/authorize-turnstile.dto';
import { StudentsRepository } from '../students/students.repository';
import { FinanceService } from '../finance/finance.service';
import { StudentStatus } from '../students/schemas/student.schema';
import { PlanDocument } from '../plans/schemas/plan.schema';
import { Checkin, CheckinDocument } from '../checkin/schemas/checkin.schema';

export interface TurnstileResult {
  authorized: boolean;
  reason?: string;
}

/**
 * Get the ISO week number for a given date
 */
function getISOWeekNumber(date: Date): { weekNumber: number; year: number } {
  const d = new Date(
    Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()),
  );
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const weekNumber = Math.ceil(
    ((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7,
  );
  return { weekNumber, year: d.getUTCFullYear() };
}

@Injectable()
export class TurnstileService {
  constructor(
    @InjectModel(TurnstileLog.name)
    private readonly turnstileLogModel: Model<TurnstileLogDocument>,
    @InjectModel(Checkin.name)
    private readonly checkinModel: Model<CheckinDocument>,
    private readonly studentsRepository: StudentsRepository,
    private readonly financeService: FinanceService,
  ) {}

  /**
   * Authorize turnstile access for a student
   * Applies the same business rules as check-in:
   * 1. Student must exist and be active
   * 2. No overdue payments
   * 3. Weekly check-in limit not exceeded
   * Registers a log regardless of result
   */
  async authorize(
    authorizeTurnstileDto: AuthorizeTurnstileDto,
  ): Promise<TurnstileResult> {
    const { studentId } = authorizeTurnstileDto;
    let result: TurnstileResult;

    try {
      // Rule 1: Verify student exists and is active
      const student = await this.studentsRepository.findById(studentId);

      if (!student) {
        result = { authorized: false, reason: 'Student not found' };
      } else if (student.status !== StudentStatus.ACTIVE) {
        result = {
          authorized: false,
          reason: `Student is ${student.status}. Access denied.`,
        };
      } else {
        // Rule 2: Check for overdue payments
        const hasOverdue =
          await this.financeService.hasOverdueFinance(studentId);

        if (hasOverdue) {
          result = {
            authorized: false,
            reason: 'Payment overdue. Please regularize your situation.',
          };
        } else {
          // Rule 3: Check weekly check-in limit
          const plan = student.planId as unknown as PlanDocument;

          if (plan && plan.weeklyCheckinLimit) {
            const now = new Date();
            const { weekNumber, year } = getISOWeekNumber(now);

            const weeklyCount = await this.checkinModel
              .countDocuments({
                studentId: new Types.ObjectId(studentId),
                weekNumber,
                year,
                authorized: true,
              })
              .exec();

            if (weeklyCount >= plan.weeklyCheckinLimit) {
              result = {
                authorized: false,
                reason: `Weekly check-in limit of ${plan.weeklyCheckinLimit} reached.`,
              };
            } else {
              result = { authorized: true };
            }
          } else {
            result = { authorized: true };
          }
        }
      }
    } catch {
      result = {
        authorized: false,
        reason: 'Internal error validating access',
      };
    }

    // Always register a log entry for turnstile access attempts
    await this.turnstileLogModel.create({
      studentId: new Types.ObjectId(studentId),
      authorized: result.authorized,
      reason: result.reason,
      timestamp: new Date(),
    });

    return result;
  }

  /**
   * List turnstile logs with pagination
   */
  async findLogs(
    page: number = 1,
    limit: number = 20,
  ): Promise<{ data: TurnstileLogDocument[]; total: number; page: number; limit: number }> {
    try {
      const skip = (page - 1) * limit;

      const [data, total] = await Promise.all([
        this.turnstileLogModel
          .find()
          .populate('studentId')
          .sort({ timestamp: -1 })
          .skip(skip)
          .limit(limit)
          .exec(),
        this.turnstileLogModel.countDocuments().exec(),
      ]);

      return { data, total, page, limit };
    } catch {
      throw new HttpException(
        'Error fetching turnstile logs',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
