import {
  Controller,
  Get,
  Post,
  Put,
  Param,
  Body,
  Query,
  UseGuards,
  ParseUUIDPipe,
  UnauthorizedException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { NftService } from './nft.service';
import { WalletAuthGuard } from '../common/guards/wallet-auth.guard';
import { TransferNFTDto, UpdateTransactionDto } from './dto/nft.dto';
import { PaginationDto } from './dto/pagination.dto';
import { User } from '../common/decorators/user.decorator';

@ApiTags('NFTs')
@Controller('nfts')
@UseGuards(WalletAuthGuard)
export class NftController {
  constructor(private readonly nftService: NftService) {}

  @Get(':walletAddress')
  @ApiOperation({ summary: 'Get NFTs for a wallet address' })
  @ApiResponse({ status: 200, description: 'Returns NFTs with pagination' })
  async getNFTs(
    @Param('walletAddress') walletAddress: string,
    @Query() paginationDto: PaginationDto,
  ) {
    return this.nftService.getNFTs(walletAddress, paginationDto);
  }

  @Get(':walletAddress/:contractAddress/:tokenId/verify')
  @ApiOperation({ summary: 'Verify NFT ownership' })
  @ApiResponse({ status: 200, description: 'Returns ownership status' })
  async verifyOwnership(
    @Param('walletAddress') walletAddress: string,
    @Param('contractAddress') contractAddress: string,
    @Param('tokenId') tokenId: string,
  ) {
    return {
      isOwner: await this.nftService.verifyNFTOwnership(walletAddress, contractAddress, tokenId),
    };
  }

  @Post('transfer/:walletAddress')
  @ApiOperation({ summary: 'Transfer an NFT' })
  @ApiResponse({ status: 201, description: 'NFT transfer initiated' })
  async transferNFT(
    @Param('walletAddress') walletAddress: string,
    @Body() transferDto: TransferNFTDto,
    @User() user: any,
  ) {
    if (user.walletAddress.toLowerCase() !== walletAddress.toLowerCase()) {
      throw new UnauthorizedException('You can only transfer NFTs from your own wallet');
    }

    const result = await this.nftService.transferNFT(
      walletAddress,
      transferDto.recipient,
      transferDto.contractAddress,
      transferDto.tokenId,
      transferDto.tokenType,
    );

    return {
      data: result,
      meta: {
        timestamp: new Date().toISOString(),
      },
    };
  }

  @Get('transaction/:id')
  @ApiOperation({ summary: 'Get transaction status' })
  @ApiResponse({ status: 200, description: 'Returns transaction details' })
  async getTransactionStatus(@Param('id', ParseUUIDPipe) transactionId: string) {
    return this.nftService.getTransactionStatus(transactionId);
  }

  @Put('transaction/:id')
  @ApiOperation({ summary: 'Update transaction status' })
  @ApiResponse({ status: 200, description: 'Transaction status updated' })
  async updateTransactionStatus(
    @Param('id', ParseUUIDPipe) transactionId: string,
    @Body() updateDto: UpdateTransactionDto,
  ) {
    return this.nftService.updateTransactionStatus(transactionId, updateDto);
  }
}
