import { IsString, IsEthereumAddress, IsEnum, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum NFTType {
  ERC721 = 'ERC721',
  ERC1155 = 'ERC1155',
}

export class TransferNftDto {
  @ApiProperty({
    description: 'Recipient identifier (username or address)',
    example: 'crypto_whale',
  })
  @IsString()
  recipient: string;

  @ApiProperty({
    description: 'NFT contract address',
    example: '0x742d35Cc6634C0532925a3b844Bc454e4438f44e',
  })
  @IsEthereumAddress()
  contractAddress: string;

  @ApiProperty({
    description: 'Token ID of the NFT',
    example: '1234',
  })
  @IsString()
  tokenId: string;

  @ApiPropertyOptional({
    description: 'Type of NFT (ERC721 or ERC1155)',
    enum: NFTType,
    default: NFTType.ERC721,
  })
  @IsEnum(NFTType)
  @IsOptional()
  tokenType?: NFTType = NFTType.ERC721;
}

export class UpdateTransactionDto {
  @IsString()
  @IsEnum(['pending', 'completed', 'failed'])
  status: string;

  @IsString()
  txHash: string;

  @IsString()
  @IsOptional()
  error?: string;
}
