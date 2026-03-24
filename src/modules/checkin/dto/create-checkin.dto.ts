import { IsString } from 'class-validator';

export class CreateCheckinDto {
  @IsString()
  studentId!: string;
}
