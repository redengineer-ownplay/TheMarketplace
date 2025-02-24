import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import { TooManyRequestsException } from 'src/common/exceptions/custom-exceptions';
import { RATE_LIMIT_KEY, RateLimitOptions } from '../decorators/rate-limit.decorator';
import { RateLimitService } from 'src/core/rate-limit/rate-limit.service';

@Injectable()
export class RateLimitGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private rateLimitService: RateLimitService,
  ) {}

  canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
    const request = context.switchToHttp().getRequest();
    const key = request.params.walletAddress
      ? `${request.ip}-${request.params.walletAddress}`
      : request.ip;

    const options = this.reflector.get<RateLimitOptions>(RATE_LIMIT_KEY, context.getHandler());

    const limiterType = options?.limiterType || 'nft';

    const rateLimiter = this.rateLimitService.getLimiter(limiterType);

    return rateLimiter
      .consume(key)
      .then(() => true)
      .catch(() => {
        throw new TooManyRequestsException('Too many requests, please try again later');
      });
  }
}
