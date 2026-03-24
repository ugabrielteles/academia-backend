import { IsDateString, IsEnum, IsOptional } from 'class-validator';
import { FinanceStatus } from '../schemas/finance.schema';

export class UpdateFinanceDto {
  @IsOptional()
  @IsEnum(FinanceStatus)
  status?: FinanceStatus;

  @IsOptional()
  @IsDateString()
  paidAt?: string;
}
