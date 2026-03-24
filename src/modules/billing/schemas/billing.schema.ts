import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type BillingDocument = Billing & Document;

export enum BillingStatus {
  PENDING = 'pending',
  SENT = 'sent',
  PAID = 'paid',
}

@Schema({ timestamps: true })
export class Billing {
  @Prop({ type: Types.ObjectId, ref: 'Student', required: true, index: true })
  studentId!: Types.ObjectId;

  @Prop({ required: true })
  amount!: number;

  @Prop({ required: true })
  dueDate!: Date;

  @Prop({
    type: String,
    enum: BillingStatus,
    default: BillingStatus.PENDING,
  })
  status!: BillingStatus;

  @Prop({ required: false })
  notifiedAt?: Date;
}

export const BillingSchema = SchemaFactory.createForClass(Billing);
