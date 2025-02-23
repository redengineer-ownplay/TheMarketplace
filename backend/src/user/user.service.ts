import { Injectable, Inject, NotFoundException, BadRequestException } from '@nestjs/common';
import { SupabaseClient } from '@supabase/supabase-js';
import { UpdateUserDto } from './dto/user.dto';

@Injectable()
export class UserService {
  constructor(
    @Inject('SUPABASE_CLIENT')
    private supabase: SupabaseClient,
  ) {}

  async findByUsername(username: string) {
    const { data, error } = await this.supabase
      .from('users')
      .select('*')
      .eq('username', username)
      .maybeSingle();

    if (error) {
      throw error;
    }

    if (!data) {
      throw new NotFoundException('User not found');
    }

    return {
      id: data.id,
      username: data.username,
      wallet_address: data.wallet_address,
      display_name: data.display_name,
      bio: data.bio,
    };
  }

  async findByWalletAddress(walletAddress: string) {
    if (!walletAddress) {
      throw new BadRequestException('Wallet address is required');
    }

    const { data, error } = await this.supabase
      .from('users')
      .select('*')
      .eq('wallet_address', walletAddress.toLowerCase())
      .maybeSingle();

    if (error) {
      throw error;
    }

    if (!data) {
      return null;
    }

    return {
      id: data.id,
      username: data.username,
      wallet_address: data.wallet_address,
      display_name: data.display_name,
      bio: data.bio,
    };
  }

  async createUser(walletAddress: string) {
    if (!walletAddress) {
      throw new BadRequestException('Wallet address is required');
    }

    const { data, error } = await this.supabase
      .from('users')
      .insert([
        {
          wallet_address: walletAddress.toLowerCase(),
          username: null,
          display_name: null,
          bio: null,
        },
      ])
      .select()
      .single();

    if (error) {
      throw error;
    }

    return data;
  }

  async updateProfile(walletAddress: string, updateData: UpdateUserDto) {
    if (!walletAddress) {
      throw new BadRequestException('Wallet address is required');
    }

    if (updateData.username) {
      const { data: existingUser } = await this.supabase
        .from('users')
        .select('wallet_address')
        .eq('username', updateData.username)
        .neq('wallet_address', walletAddress.toLowerCase())
        .maybeSingle();

      if (existingUser) {
        throw new BadRequestException('Username is already taken');
      }
    }

    const { data, error } = await this.supabase
      .from('users')
      .update({
        username: updateData.username,
        display_name: updateData.displayName,
        bio: updateData.bio,
        updated_at: new Date().toISOString(),
      })
      .eq('wallet_address', walletAddress.toLowerCase())
      .select()
      .single();

    if (error) {
      throw error;
    }

    if (!data) {
      throw new NotFoundException('User not found');
    }

    return data;
  }
}
