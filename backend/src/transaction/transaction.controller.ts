import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import { TransactionService } from './transaction.service';
import { WalletAuthGuard } from '../common/guards/wallet-auth.guard';
import { PaginationDto } from '../nft/dto/pagination.dto';

@ApiTags('Transactions')
@Controller('transactions')
@UseGuards(WalletAuthGuard)
@ApiBearerAuth()
export class TransactionController {
  constructor(private readonly transactionService: TransactionService) {}

  @Get(':walletAddress')
  @ApiOperation({ summary: 'Get transactions for a wallet' })
  @ApiResponse({
    status: 200,
    description: 'Returns transactions with pagination',
  })
  async getTransactions(
    @Param('walletAddress') walletAddress: string,
    @Query() paginationDto: PaginationDto,
  ) {
    return this.transactionService.getTransactionsByAddress(walletAddress, paginationDto);
  }
}
