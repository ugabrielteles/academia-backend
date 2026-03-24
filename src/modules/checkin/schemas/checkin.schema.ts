import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type CheckinDocument = Checkin & Document;

@Schema({ timestamps: true })
export class Checkin {
  @Prop({ type: Types.ObjectId, ref: 'Student', required: true, index: true })
  studentId!: Types.ObjectId;

  @Prop({ required: true })
  date!: Date;

  /** ISO week number (1-53) for weekly check-in limit tracking */
  @Prop({ required: true })
  weekNumber!: number;

  @Prop({ required: true })
  year!: number;

  @Prop({ required: true })
  authorized!: boolean;
}

export const CheckinSchema = SchemaFactory.createForClass(Checkin);

// Index for efficient weekly count queries
CheckinSchema.index({ studentId: 1, weekNumber: 1, year: 1 });
