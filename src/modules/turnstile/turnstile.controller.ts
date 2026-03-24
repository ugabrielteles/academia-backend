import {
  Controller,
  Post,
  Get,
  Body,
  Query,
  UseGuards,
} from '@nestjs/common';
import { TurnstileService, TurnstileResult } from './turnstile.service';
import { AuthorizeTurnstileDto } from './dto/authorize-turnstile.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { TurnstileLogDocument } from './schemas/turnstile-log.schema';

@Controller('turnstile')
@UseGuards(JwtAuthGuard, RolesGuard)
export class TurnstileController {
  constructor(private readonly turnstileService: TurnstileService) {}

  /**
   * POST /turnstile/authorize
   * Validates and authorizes student access through the turnstile
   */
  @Post('authorize')
  @Roles('admin', 'staff')
  async authorize(@Body() authorizeTurnstileDto: AuthorizeTurnstileDto): Promise<TurnstileResult> {
    return this.turnstileService.authorize(authorizeTurnstileDto);
  }

  /**
   * GET /turnstile/logs - List turnstile access logs with pagination
   * Query params: page (default: 1), limit (default: 20)
   */
  @Get('logs')
  @Roles('admin', 'staff')
  async getLogs(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ): Promise<{ data: TurnstileLogDocument[]; total: number; page: number; limit: number }> {
    const pageNum = page ? parseInt(page, 10) : 1;
    const limitNum = limit ? parseInt(limit, 10) : 20;
    return this.turnstileService.findLogs(pageNum, limitNum);
  }
}
