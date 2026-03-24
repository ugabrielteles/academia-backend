import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type StudentDocument = Student & Document;

export enum StudentStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  BLOCKED = 'blocked',
}

@Schema({ timestamps: true })
export class Student {
  @Prop({ required: true })
  name!: string;

  @Prop({ required: true, unique: true, index: true })
  email!: string;

  @Prop({ required: true })
  phone!: string;

  @Prop({ type: Types.ObjectId, ref: 'Plan', required: false })
  planId?: Types.ObjectId;

  @Prop({
    type: String,
    enum: StudentStatus,
    default: StudentStatus.ACTIVE,
  })
  status!: StudentStatus;

  /** Password hash stored separately; not selected by default */
  @Prop({ required: true, select: false })
  passwordHash!: string;

  /** Role for access control: admin or staff */
  @Prop({ type: String, default: 'staff' })
  role!: string;
}

export const StudentSchema = SchemaFactory.createForClass(Student);
