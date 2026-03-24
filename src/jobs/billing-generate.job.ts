import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { StudentsRepository } from '../modules/students/students.repository';
import { FinanceService } from '../modules/finance/finance.service';
import { PlanDocument } from '../modules/plans/schemas/plan.schema';

@Injectable()
export class BillingGenerateJob {
  private readonly logger = new Logger(BillingGenerateJob.name);

  constructor(
    private readonly studentsRepository: StudentsRepository,
    private readonly financeService: FinanceService,
  ) {}

  /**
   * Runs on the 1st of every month at 08:00
   * Generates finance records for all active students based on their plan
   * with a due date of the 10th of the current month
   */
  @Cron('0 8 1 * *')
  async handleMonthlyBillingGeneration(): Promise<void> {
    const now = new Date();
    this.logger.log(
      `[${now.toISOString()}] Starting monthly billing generation...`,
    );

    try {
      const activeStudents =
        await this.studentsRepository.findActiveStudents();

      let generatedCount = 0;

      for (const student of activeStudents) {
        const plan = student.planId as unknown as PlanDocument;

        if (!plan) {
          this.logger.warn(
            `Student ${student._id} has no plan assigned. Skipping.`,
          );
          continue;
        }

        // Due date is the 10th of the current month
        const dueDate = new Date(now.getFullYear(), now.getMonth(), 10);

        try {
          await this.financeService.createForStudent(
            (student._id as { toString(): string }).toString(),
            (plan._id as { toString(): string }).toString(),
            plan.price,
            dueDate,
          );
          generatedCount++;
        } catch (error) {
          this.logger.error(
            `Failed to generate billing for student ${student._id}: ${error instanceof Error ? error.message : 'Unknown error'}`,
          );
        }
      }

      this.logger.log(
        `[${now.toISOString()}] Monthly billing generation complete. Generated ${generatedCount} records.`,
      );
    } catch (error) {
      this.logger.error(
        `Error during monthly billing generation: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }
}
