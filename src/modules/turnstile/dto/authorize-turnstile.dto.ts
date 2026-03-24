import { IsString } from 'class-validator';

export class AuthorizeTurnstileDto {
  @IsString()
  studentId!: string;
}
