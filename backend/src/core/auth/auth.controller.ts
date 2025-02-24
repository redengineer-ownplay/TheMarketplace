import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { WalletAuthDto } from './dto/auth.dto';
import { RateLimitGuard } from 'src/common/guards/rate-limit.guard';
import { RateLimit } from 'src/common/decorators/rate-limit.decorator';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @ApiOperation({ summary: 'Login with wallet' })
  @ApiResponse({ status: 200, description: 'Returns JWT token' })
  @UseGuards(RateLimitGuard)
  @RateLimit({ limiterType: 'auth' })
  async login(@Body() authDto: WalletAuthDto) {
    return this.authService.login(authDto.walletAddress, authDto.message, authDto.signature);
  }
}
