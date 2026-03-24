import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ScheduleModule } from '@nestjs/schedule';
import { AuthModule } from './modules/auth/auth.module';
import { StudentsModule } from './modules/students/students.module';
import { PlansModule } from './modules/plans/plans.module';
import { WorkoutsModule } from './modules/workouts/workouts.module';
import { CheckinModule } from './modules/checkin/checkin.module';
import { TurnstileModule } from './modules/turnstile/turnstile.module';
import { FinanceModule } from './modules/finance/finance.module';
import { BillingModule } from './modules/billing/billing.module';
import { CheckinResetJob } from './jobs/checkin-reset.job';
import { BillingGenerateJob } from './jobs/billing-generate.job';
import { BillingNotifyJob } from './jobs/billing-notify.job';

@Module({
  imports: [
    // MongoDB connection
    MongooseModule.forRoot(
      process.env.MONGODB_URI ?? 'mongodb://localhost:27017/academia',
    ),
    // Schedule module for cron jobs
    ScheduleModule.forRoot(),
    // Feature modules
    AuthModule,
    StudentsModule,
    PlansModule,
    WorkoutsModule,
    CheckinModule,
    TurnstileModule,
    FinanceModule,
    BillingModule,
  ],
  providers: [CheckinResetJob, BillingGenerateJob, BillingNotifyJob],
})
export class AppModule {}
