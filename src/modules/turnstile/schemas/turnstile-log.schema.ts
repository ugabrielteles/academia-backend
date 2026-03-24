import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type TurnstileLogDocument = TurnstileLog & Document;

@Schema()
export class TurnstileLog {
  @Prop({ type: Types.ObjectId, ref: 'Student', required: true, index: true })
  studentId!: Types.ObjectId;

  @Prop({ required: true })
  authorized!: boolean;

  /** Reason for denial; only set when authorized is false */
  @Prop({ required: false })
  reason?: string;

  @Prop({ required: true, default: () => new Date() })
  timestamp!: Date;
}

export const TurnstileLogSchema = SchemaFactory.createForClass(TurnstileLog);
