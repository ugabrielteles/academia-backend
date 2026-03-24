import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CheckinController } from './checkin.controller';
import { CheckinService } from './checkin.service';
import { Checkin, CheckinSchema } from './schemas/checkin.schema';
import { StudentsModule } from '../students/students.module';
import { FinanceModule } from '../finance/finance.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Checkin.name, schema: CheckinSchema },
    ]),
    StudentsModule,
    FinanceModule,
  ],
  controllers: [CheckinController],
  providers: [CheckinService],
  exports: [CheckinService],
})
export class CheckinModule {}
