import {
  Injectable,
  UnauthorizedException,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { Student, StudentDocument } from '../students/schemas/student.schema';

interface AuthUser {
  _id: string;
  email: string;
  role: string;
  passwordHash: string;
}

export interface LoginResponse {
  access_token: string;
}

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(Student.name)
    private readonly studentModel: Model<StudentDocument>,
    private readonly jwtService: JwtService,
  ) {}

  /**
   * Validates user credentials by checking email and password hash
   */
  async validateUser(
    email: string,
    password: string,
  ): Promise<AuthUser | null> {
    try {
      const student = await this.studentModel
        .findOne({ email })
        .select('+passwordHash')
        .lean<AuthUser>()
        .exec();

      if (!student) {
        return null;
      }

      const isPasswordValid = await bcrypt.compare(
        password,
        student.passwordHash,
      );

      if (!isPasswordValid) {
        return null;
      }

      return student;
    } catch {
      throw new HttpException(
        'Error validating credentials',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Generates JWT access token for authenticated user
   */
  async login(user: AuthUser): Promise<LoginResponse> {
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload = {
      sub: user._id.toString(),
      email: user.email,
      role: user.role ?? 'staff',
    };

    return {
      access_token: this.jwtService.sign(payload),
    };
  }
}
