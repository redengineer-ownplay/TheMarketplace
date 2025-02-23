import { Module } from '@nestjs/common';
import { TransactionController } from './transaction.controller';
import { TransactionService } from './services/transaction.service';
import { NFTMetadataService } from 'src/features/nft/services/metadata.service';
import { CacheService } from 'src/core/cache/cache.service';

@Module({
  controllers: [TransactionController],
  providers: [TransactionService, CacheService, NFTMetadataService],
  exports: [TransactionService],
})
export class TransactionModule {}
