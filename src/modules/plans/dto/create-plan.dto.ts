import {
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  Min,
} from 'class-validator';

export class CreatePlanDto {
  @IsString()
  name!: string;

  @IsNumber()
  @IsPositive()
  price!: number;

  @IsNumber()
  @Min(1)
  durationMonths!: number;

  @IsNumber()
  @Min(1)
  weeklyCheckinLimit!: number;

  @IsOptional()
  @IsString()
  description?: string;
}
