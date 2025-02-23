import { Module } from '@nestjs/common';
import { TransactionController } from './transaction.controller';
import { TransactionService } from './transaction.service';
import { NFTMetadataService } from '../nft/services/metadata.service';
import { CacheService } from 'src/cache/cache.service';

@Module({
  controllers: [TransactionController],
  providers: [TransactionService, CacheService, NFTMetadataService],
  exports: [TransactionService],
})
export class TransactionModule {}
