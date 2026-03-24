import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { TurnstileController } from './turnstile.controller';
import { TurnstileService } from './turnstile.service';
import {
  TurnstileLog,
  TurnstileLogSchema,
} from './schemas/turnstile-log.schema';
import { StudentsModule } from '../students/students.module';
import { FinanceModule } from '../finance/finance.module';
import { Checkin, CheckinSchema } from '../checkin/schemas/checkin.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: TurnstileLog.name, schema: TurnstileLogSchema },
      // Turnstile needs checkin model to count weekly check-ins
      { name: Checkin.name, schema: CheckinSchema },
    ]),
    StudentsModule,
    FinanceModule,
  ],
  controllers: [TurnstileController],
  providers: [TurnstileService],
  exports: [TurnstileService],
})
export class TurnstileModule {}
