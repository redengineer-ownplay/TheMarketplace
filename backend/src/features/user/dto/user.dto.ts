import { IsString, IsOptional, Length, Matches } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateUserDto {
  @ApiProperty({
    description: 'Username for the user profile',
    example: 'crypto_whale',
    minLength: 3,
    maxLength: 30,
  })
  @IsString()
  @Length(3, 30)
  @Matches(/^[a-zA-Z0-9_]+$/, {
    message: 'Username can only contain letters, numbers, and underscores',
  })
  username: string;

  @ApiPropertyOptional({
    description: 'Display name for the user profile',
    example: 'Crypto Whale',
  })
  @IsString()
  @IsOptional()
  @Length(1, 50)
  displayName?: string;

  @ApiPropertyOptional({
    description: 'Bio or description for the user profile',
    example: 'NFT collector and crypto enthusiast',
  })
  @IsString()
  @IsOptional()
  @Length(0, 500)
  bio?: string;
}
