import {
  IsDateString,
  IsEnum,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
} from 'class-validator';
import { FinanceStatus } from '../schemas/finance.schema';

export class CreateFinanceDto {
  @IsString()
  studentId!: string;

  @IsString()
  planId!: string;

  @IsNumber()
  @IsPositive()
  amount!: number;

  @IsDateString()
  dueDate!: string;

  @IsOptional()
  @IsEnum(FinanceStatus)
  status?: FinanceStatus;
}
