import {
  IsEmail,
  IsEnum,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';
import { StudentStatus } from '../schemas/student.schema';

export class CreateStudentDto {
  @IsString()
  name!: string;

  @IsEmail()
  email!: string;

  @IsString()
  phone!: string;

  @IsOptional()
  @IsString()
  planId?: string;

  @IsString()
  @MinLength(6)
  password!: string;

  @IsOptional()
  @IsEnum(StudentStatus)
  status?: StudentStatus;
}
