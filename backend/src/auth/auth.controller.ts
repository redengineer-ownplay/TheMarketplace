import { Controller, Post, Body } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { WalletAuthDto } from './dto/auth.dto';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @ApiOperation({ summary: 'Login with wallet' })
  @ApiResponse({ status: 200, description: 'Returns JWT token' })
  async login(@Body() authDto: WalletAuthDto) {
    return this.authService.login(authDto.walletAddress, authDto.message, authDto.signature);
  }
}
