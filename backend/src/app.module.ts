import { MiddlewareConsumer, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import * as Joi from 'joi';
import { UserModule } from './features/user/user.module';
import { NftModule } from './features/nft/nft.module';
import { AuthModule } from './core/auth/auth.module';
import { SupabaseModule } from './core/database/supabase.module';
import { SharedModule } from './core/shared/shared.module';
import { TransactionModule } from './features/transaction/transaction.module';
import { CacheModule } from './core/cache/cache.module';
import { RateLimitModule } from './core/rate-limit/rate-limit.module';
import { RateLimitMiddleware } from './common/middleware/rate-limit.middleware';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: Joi.object({
        NODE_ENV: Joi.string()
          .valid('development', 'production', 'test', 'provision')
          .default('development'),
        PORT: Joi.number().port().default(3000),
      }),
    }),
    SupabaseModule,
    CacheModule,
    RateLimitModule,
    SharedModule,
    AuthModule,
    UserModule,
    NftModule,
    TransactionModule,
  ],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(RateLimitMiddleware).forRoutes('*');
  }
}
