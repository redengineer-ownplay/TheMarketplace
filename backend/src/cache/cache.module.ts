import { Module } from '@nestjs/common';
import { CacheService } from './cache.service';

@Module({
  providers: [CacheService], // Provide the service
  exports: [CacheService], // Export the service for use in other modules
})
export class CacheModule {}
