import {
  IsArray,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  Min,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class ExerciseDto {
  @IsString()
  name!: string;

  @IsNumber()
  @Min(1)
  sets!: number;

  @IsNumber()
  @Min(1)
  reps!: number;

  @IsOptional()
  @IsNumber()
  @IsPositive()
  weight?: number;
}

export class CreateWorkoutDto {
  @IsString()
  studentId!: string;

  @IsString()
  name!: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ExerciseDto)
  exercises!: ExerciseDto[];
}
