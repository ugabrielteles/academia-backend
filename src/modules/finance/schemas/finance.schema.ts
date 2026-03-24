import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type FinanceDocument = Finance & Document;

export enum FinanceStatus {
  PENDING = 'pending',
  PAID = 'paid',
  OVERDUE = 'overdue',
}

@Schema({ timestamps: true })
export class Finance {
  @Prop({ type: Types.ObjectId, ref: 'Student', required: true, index: true })
  studentId!: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Plan', required: true })
  planId!: Types.ObjectId;

  @Prop({ required: true })
  amount!: number;

  @Prop({ required: true, index: true })
  dueDate!: Date;

  @Prop({ required: false })
  paidAt?: Date;

  @Prop({
    type: String,
    enum: FinanceStatus,
    default: FinanceStatus.PENDING,
  })
  status!: FinanceStatus;
}

export const FinanceSchema = SchemaFactory.createForClass(Finance);

// Compound index for common queries
FinanceSchema.index({ studentId: 1, dueDate: 1 });
