import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { RateLimitFactory } from 'src/common/factories/rate-limit.factory';
import { RateLimiterRedis } from 'rate-limiter-flexible';

@Injectable()
export class RateLimitService implements OnModuleInit {
  private readonly limiters: Map<string, RateLimiterRedis> = new Map();

  constructor(
    private readonly rateLimitFactory: RateLimitFactory,
    private readonly configService: ConfigService,
  ) {}

  onModuleInit() {
    this.initDefaultLimiters();
  }

  private initDefaultLimiters() {
    this.limiters.set('auth', this.rateLimitFactory.createRateLimiter('auth', 10, 60));

    this.limiters.set('nft', this.rateLimitFactory.createRateLimiter('nft', 60, 60));

    this.limiters.set(
      'nft:transfer',
      this.rateLimitFactory.createRateLimiter('nft:transfer', 5, 60),
    );

    this.limiters.set('user', this.rateLimitFactory.createRateLimiter('user', 30, 60));

    this.limiters.set(
      'transaction',
      this.rateLimitFactory.createRateLimiter('transaction', 60, 60),
    );
  }

  getLimiter(name: string): RateLimiterRedis {
    if (!this.limiters.has(name)) {
      throw new Error(`Rate limiter ${name} does not exist`);
    }
    return this.limiters.get(name) as RateLimiterRedis;
  }
}
