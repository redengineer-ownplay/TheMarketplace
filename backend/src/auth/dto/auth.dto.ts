import { IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { IsEVMAddress } from '../../common/pipes/evm-address.validator';

export class WalletAuthDto {
  @ApiProperty({
    description: 'Wallet address (Ethereum/Polygon)',
    example: '0x742d35Cc6634C0532925a3b844Bc454e4438f44e',
  })
  @IsEVMAddress()
  walletAddress: string;

  @ApiProperty({
    description: 'Message that was signed',
    example: 'Sign this message to verify your wallet ownership. Nonce: 123456',
  })
  @IsString()
  message: string;

  @ApiProperty({
    description: 'Signature of the message',
    example: '0x...',
  })
  @IsString()
  signature: string;
}
