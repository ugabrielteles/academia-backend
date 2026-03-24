import {
  IsDateString,
  IsNumber,
  IsPositive,
  IsString,
} from 'class-validator';

export class CreateBillingDto {
  @IsString()
  studentId!: string;

  @IsNumber()
  @IsPositive()
  amount!: number;

  @IsDateString()
  dueDate!: string;
}
