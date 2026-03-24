import { Controller, Post, UseGuards, Request } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AuthService, LoginResponse } from './auth.service';

interface RequestWithUser {
  user: {
    _id: string;
    email: string;
    role: string;
    passwordHash: string;
  };
}

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  /**
   * POST /auth/login
   * Authenticates user with email and password, returns JWT access token
   */
  @UseGuards(AuthGuard('local'))
  @Post('login')
  async login(@Request() req: RequestWithUser): Promise<LoginResponse> {
    return this.authService.login(req.user);
  }
}
