import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { FinanceService } from '../modules/finance/finance.service';
import { StudentsRepository } from '../modules/students/students.repository';
import { StudentStatus } from '../modules/students/schemas/student.schema';

@Injectable()
export class BillingNotifyJob {
  private readonly logger = new Logger(BillingNotifyJob.name);

  constructor(
    private readonly financeService: FinanceService,
    private readonly studentsRepository: StudentsRepository,
  ) {}

  /**
   * Runs daily at 09:00
   * 1. Finds pending finance records past their due date and marks them as overdue
   * 2. Finds students with overdue finance and sets their status to blocked
   */
  @Cron('0 9 * * *')
  async handleDailyBillingNotification(): Promise<void> {
    const now = new Date();
    this.logger.log(
      `[${now.toISOString()}] Starting daily billing notification check...`,
    );

    try {
      // Step 1: Find pending finance records with past due dates
      const overdueFinances = await this.financeService.findOverduePending();

      if (overdueFinances.length > 0) {
        const overdueIds = overdueFinances.map((f) =>
          (f._id as { toString(): string }).toString(),
        );

        // Mark them as overdue
        await this.financeService.markAsOverdue(overdueIds);

        this.logger.log(
          `Marked ${overdueIds.length} finance records as overdue.`,
        );
      }

      // Step 2: Find students with overdue finance and block them
      const studentIdsWithOverdue =
        await this.financeService.findStudentIdsWithOverdue();

      if (studentIdsWithOverdue.length > 0) {
        let blockedCount = 0;

        for (const studentId of studentIdsWithOverdue) {
          try {
            await this.studentsRepository.updateStatus(
              studentId,
              StudentStatus.BLOCKED,
            );
            blockedCount++;
          } catch (error) {
            this.logger.error(
              `Failed to block student ${studentId}: ${error instanceof Error ? error.message : 'Unknown error'}`,
            );
          }
        }

        this.logger.log(
          `Blocked ${blockedCount} students due to overdue payments.`,
        );
      }

      this.logger.log(
        `[${now.toISOString()}] Daily billing notification check complete.`,
      );
    } catch (error) {
      this.logger.error(
        `Error during daily billing notification: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }
}
