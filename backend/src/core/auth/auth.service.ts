import { Injectable, Inject } from '@nestjs/common';
import { ethers } from 'ethers';
import { ConfigService } from '@nestjs/config';
import { UserService } from 'src/features/user/services/user.service';
import * as jwt from 'jsonwebtoken';
import { SupabaseClient } from '@supabase/supabase-js';

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private configService: ConfigService,
    @Inject('SUPABASE_CLIENT') private supabase: SupabaseClient,
  ) {}

  verifySignature(walletAddress: string, message: string, signature: string): boolean {
    try {
      const recoveredAddress = ethers.utils.verifyMessage(message, signature);
      return recoveredAddress.toLowerCase() === walletAddress.toLowerCase();
    } catch {
      return false;
    }
  }

  async login(walletAddress: string, message: string, signature: string) {
    const isValid = this.verifySignature(walletAddress, message, signature);
    if (!isValid) {
      throw new Error('Invalid signature');
    }

    try {
      let user = await this.userService.findByWalletAddress(walletAddress);

      if (!user) {
        user = await this.userService.createUser(walletAddress);
      }

      const jwtSecret = this.configService.get<string>('JWT_SECRET');
      if (!jwtSecret) {
        throw new Error('JWT_SECRET is not defined');
      }

      const token = jwt.sign(
        {
          walletAddress: user?.wallet_address,
          userId: user?.id,
        },
        jwtSecret,
        { expiresIn: '24h' },
      );

      return {
        token,
        user: {
          id: user?.id,
          walletAddress: user?.wallet_address,
          username: user?.username,
        },
      };
    } catch (error) {
      console.error('Login error:', error);
      throw new Error('Authentication failed');
    }
  }

  verifyToken(token: string) {
    try {
      const jwtSecret = this.configService.get<string>('JWT_SECRET');
      if (!jwtSecret) {
        throw new Error('JWT_SECRET is not defined');
      }
      return jwt.verify(token, jwtSecret);
    } catch {
      return null;
    }
  }
}
