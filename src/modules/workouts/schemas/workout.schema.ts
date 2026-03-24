import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type WorkoutDocument = Workout & Document;

/** Sub-document for individual exercises within a workout */
@Schema({ _id: false })
export class Exercise {
  @Prop({ required: true })
  name!: string;

  @Prop({ required: true })
  sets!: number;

  @Prop({ required: true })
  reps!: number;

  @Prop({ required: false })
  weight?: number;
}

export const ExerciseSchema = SchemaFactory.createForClass(Exercise);

@Schema({ timestamps: true })
export class Workout {
  @Prop({ type: Types.ObjectId, ref: 'Student', required: true })
  studentId!: Types.ObjectId;

  @Prop({ required: true })
  name!: string;

  @Prop({ type: [ExerciseSchema], default: [] })
  exercises!: Exercise[];
}

export const WorkoutSchema = SchemaFactory.createForClass(Workout);
