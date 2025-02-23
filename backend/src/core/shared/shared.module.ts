import { Module, Global } from '@nestjs/common';
import { UserService } from 'src/features/user/services/user.service';
import { AuthService } from 'src/core/auth/auth.service';

@Global()
@Module({
  providers: [UserService, AuthService],
  exports: [UserService, AuthService],
})
export class SharedModule {}
