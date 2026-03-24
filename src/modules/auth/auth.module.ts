import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtStrategy } from './strategies/jwt.strategy';
import { LocalStrategy } from './strategies/local.strategy';
import { Student, StudentSchema } from '../students/schemas/student.schema';

@Module({
  imports: [
    PassportModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET ?? 'default_secret',
      signOptions: {
        expiresIn: process.env.JWT_EXPIRES_IN ?? '7d',
      },
    }),
    // Auth uses the Student model to validate credentials
    MongooseModule.forFeature([
      { name: Student.name, schema: StudentSchema },
    ]),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy, LocalStrategy],
  exports: [AuthService],
})
export class AuthModule {}
