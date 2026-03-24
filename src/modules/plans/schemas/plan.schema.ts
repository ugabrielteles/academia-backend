import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type PlanDocument = Plan & Document;

@Schema({ timestamps: true })
export class Plan {
  @Prop({ required: true })
  name!: string;

  @Prop({ required: true })
  price!: number;

  @Prop({ required: true })
  durationMonths!: number;

  /** Maximum number of check-ins allowed per week */
  @Prop({ required: true })
  weeklyCheckinLimit!: number;

  @Prop({ required: false })
  description?: string;
}

export const PlanSchema = SchemaFactory.createForClass(Plan);
