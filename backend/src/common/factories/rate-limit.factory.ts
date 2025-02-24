import { Injectable } from '@nestjs/common';
import { RateLimiterRedis } from 'rate-limiter-flexible';
import { CacheService } from 'src/core/cache/cache.service';

@Injectable()
export class RateLimitFactory {
  constructor(private readonly cacheService: CacheService) {}

  createRateLimiter(prefix: string, points: number, duration: number): RateLimiterRedis {
    const redis = this.cacheService.getRedisClient();

    return new RateLimiterRedis({
      storeClient: redis,
      keyPrefix: `ratelimit:${prefix}`,
      points,
      duration,
    });
  }
}
