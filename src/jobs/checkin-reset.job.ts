import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';

@Injectable()
export class CheckinResetJob {
  private readonly logger = new Logger(CheckinResetJob.name);

  /**
   * Runs every Monday at 00:00
   * Logs a weekly reset notification.
   * The actual weekly check-in counting is handled by ISO week number
   * in the check-in schema, so no data deletion is required.
   */
  @Cron('0 0 * * 1')
  async handleWeeklyReset(): Promise<void> {
    const now = new Date();
    this.logger.log(
      `[${now.toISOString()}] Weekly check-in counter reset. New ISO week started.`,
    );
  }
}
