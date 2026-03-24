import {
  Injectable,
  NotFoundException,
  ConflictException,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { Types } from 'mongoose';
import { StudentsRepository } from './students.repository';
import { CreateStudentDto } from './dto/create-student.dto';
import { UpdateStudentDto } from './dto/update-student.dto';
import { StudentDocument, StudentStatus } from './schemas/student.schema';

@Injectable()
export class StudentsService {
  constructor(private readonly studentsRepository: StudentsRepository) {}

  async findAll(): Promise<StudentDocument[]> {
    try {
      return await this.studentsRepository.findAll();
    } catch {
      throw new HttpException(
        'Error fetching students',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async findById(id: string): Promise<StudentDocument> {
    try {
      const student = await this.studentsRepository.findById(id);

      if (!student) {
        throw new NotFoundException(`Student with ID ${id} not found`);
      }

      return student;
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      throw new HttpException(
        'Error fetching student',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async create(createStudentDto: CreateStudentDto): Promise<StudentDocument> {
    try {
      // Check if email already exists
      const existing = await this.studentsRepository.findByEmail(
        createStudentDto.email,
      );

      if (existing) {
        throw new ConflictException(
          `Student with email ${createStudentDto.email} already exists`,
        );
      }

      // Hash password before saving
      const saltRounds = 10;
      const passwordHash = await bcrypt.hash(
        createStudentDto.password,
        saltRounds,
      );

      return await this.studentsRepository.create({
        name: createStudentDto.name,
        email: createStudentDto.email,
        phone: createStudentDto.phone,
        planId: createStudentDto.planId
          ? new Types.ObjectId(createStudentDto.planId)
          : undefined,
        passwordHash,
        status: createStudentDto.status ?? StudentStatus.ACTIVE,
      });
    } catch (error) {
      if (
        error instanceof ConflictException ||
        error instanceof NotFoundException
      ) {
        throw error;
      }
      throw new HttpException(
        'Error creating student',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async update(
    id: string,
    updateStudentDto: UpdateStudentDto,
  ): Promise<StudentDocument> {
    try {
      const updateData: Record<string, unknown> = {};

      if (updateStudentDto.name !== undefined) updateData['name'] = updateStudentDto.name;
      if (updateStudentDto.email !== undefined) updateData['email'] = updateStudentDto.email;
      if (updateStudentDto.phone !== undefined) updateData['phone'] = updateStudentDto.phone;
      if (updateStudentDto.status !== undefined) updateData['status'] = updateStudentDto.status;
      if (updateStudentDto.planId !== undefined) {
        updateData['planId'] = new Types.ObjectId(updateStudentDto.planId);
      }

      // If password is being updated, hash it
      if (updateStudentDto.password) {
        const saltRounds = 10;
        updateData['passwordHash'] = await bcrypt.hash(
          updateStudentDto.password,
          saltRounds,
        );
      }

      const updated = await this.studentsRepository.update(id, updateData as Parameters<StudentsRepository['update']>[1]);

      if (!updated) {
        throw new NotFoundException(`Student with ID ${id} not found`);
      }

      return updated;
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      throw new HttpException(
        'Error updating student',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async remove(id: string): Promise<void> {
    try {
      const deleted = await this.studentsRepository.delete(id);

      if (!deleted) {
        throw new NotFoundException(`Student with ID ${id} not found`);
      }
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      throw new HttpException(
        'Error deleting student',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async updateStatus(id: string, status: StudentStatus): Promise<StudentDocument> {
    const updated = await this.studentsRepository.updateStatus(id, status);

    if (!updated) {
      throw new NotFoundException(`Student with ID ${id} not found`);
    }

    return updated;
  }
}
