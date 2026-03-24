import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Student, StudentDocument, StudentStatus } from './schemas/student.schema';

@Injectable()
export class StudentsRepository {
  constructor(
    @InjectModel(Student.name)
    private readonly studentModel: Model<StudentDocument>,
  ) {}

  async findAll(): Promise<StudentDocument[]> {
    return this.studentModel.find().populate('planId').exec();
  }

  async findById(id: string): Promise<StudentDocument | null> {
    return this.studentModel.findById(id).populate('planId').exec();
  }

  async findByEmail(email: string): Promise<StudentDocument | null> {
    return this.studentModel.findOne({ email }).exec();
  }

  async findActiveStudents(): Promise<StudentDocument[]> {
    return this.studentModel
      .find({ status: StudentStatus.ACTIVE })
      .populate('planId')
      .exec();
  }

  async findStudentsWithOverdueFinance(studentIds: string[]): Promise<StudentDocument[]> {
    const objectIds = studentIds.map((id) => new Types.ObjectId(id));
    return this.studentModel.find({ _id: { $in: objectIds } }).exec();
  }

  async create(data: Partial<Student>): Promise<StudentDocument> {
    const student = new this.studentModel(data);
    return student.save();
  }

  async update(
    id: string,
    data: Record<string, unknown>,
  ): Promise<StudentDocument | null> {
    return this.studentModel
      .findByIdAndUpdate(id, data, { new: true })
      .populate('planId')
      .exec();
  }

  async delete(id: string): Promise<StudentDocument | null> {
    return this.studentModel.findByIdAndDelete(id).exec();
  }

  async updateStatus(
    id: string,
    status: StudentStatus,
  ): Promise<StudentDocument | null> {
    return this.studentModel
      .findByIdAndUpdate(id, { status }, { new: true })
      .exec();
  }
}
