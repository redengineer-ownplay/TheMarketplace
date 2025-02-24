import { Module, Global } from '@nestjs/common';
import { RateLimitFactory } from '../../common/factories/rate-limit.factory';
import { CacheModule } from '../cache/cache.module';
import { RateLimitService } from './rate-limit.service';
import { RateLimitMiddleware } from 'src/common/middleware/rate-limit.middleware';

@Global()
@Module({
  imports: [CacheModule],
  providers: [RateLimitFactory, RateLimitMiddleware, RateLimitService],
  exports: [RateLimitFactory, RateLimitMiddleware, RateLimitService],
})
export class RateLimitModule {}
