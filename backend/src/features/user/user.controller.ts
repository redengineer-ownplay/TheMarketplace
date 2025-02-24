import {
  Controller,
  Get,
  Put,
  Param,
  Body,
  UseGuards,
  UnauthorizedException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import { UserService } from './services/user.service';
import { WalletAuthGuard } from 'src/common/guards/wallet-auth.guard';
import { UpdateUserDto } from './dto/user.dto';
import { User } from 'src/common/decorators/user.decorator';
import { RateLimitGuard } from 'src/common/guards/rate-limit.guard';
import { RateLimit } from 'src/common/decorators/rate-limit.decorator';

interface JwtPayload {
  walletAddress: string;
  userId: string;
}

@ApiTags('Users')
@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get(':walletAddress')
  @ApiOperation({ summary: 'Get user by wallet address' })
  @ApiResponse({ status: 200, description: 'Returns user details' })
  @ApiResponse({ status: 404, description: 'User not found' })
  @UseGuards(RateLimitGuard)
  @RateLimit({ limiterType: 'user' }) // 30 requests per minute
  async findByWalletAddress(@Param('walletAddress') walletAddress: string) {
    return this.userService.findByWalletAddress(walletAddress);
  }

  @Get('by-username/:username')
  @ApiOperation({ summary: 'Get user by username' })
  @ApiResponse({ status: 200, description: 'Returns user details' })
  @RateLimit({ limiterType: 'user' }) // 30 requests per minute
  async findByUsername(@Param('username') username: string) {
    return this.userService.findByUsername(username);
  }

  @Put('profile')
  @UseGuards(WalletAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update user profile' })
  @ApiResponse({ status: 200, description: 'Profile updated successfully' })
  @UseGuards(RateLimitGuard)
  @RateLimit({ limiterType: 'user' }) // 30 requests per minute
  async updateProfile(@User() user: JwtPayload, @Body() updateDto: UpdateUserDto) {
    if (!user?.walletAddress) {
      throw new UnauthorizedException('Invalid token: missing wallet address');
    }
    return this.userService.updateProfile(user.walletAddress, updateDto);
  }
}
