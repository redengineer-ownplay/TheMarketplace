import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import * as Joi from 'joi';
import { UserModule } from './user/user.module';
import { NftModule } from './nft/nft.module';
import { AuthModule } from './auth/auth.module';
import { SupabaseModule } from './supabase/supabase.module';
import { SharedModule } from './shared/shared.module';
import { TransactionModule } from './transaction/transaction.module';
import { CacheModule } from './cache/cache.module';

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
    SharedModule,
    AuthModule,
    UserModule,
    NftModule,
    TransactionModule,
  ],
})
export class AppModule {}
