import { Module } from '@nestjs/common';
import { NftService } from './services/nft.service';
import { NftController } from './nft.controller';
import { NFTMetadataService } from './services/metadata.service';
import { ConfigModule } from '@nestjs/config';
import { CacheService } from 'src/core/cache/cache.service';

@Module({
  imports: [ConfigModule],
  providers: [NftService, CacheService, NFTMetadataService],
  controllers: [NftController],
  exports: [NftService, NFTMetadataService],
})
export class NftModule {}
