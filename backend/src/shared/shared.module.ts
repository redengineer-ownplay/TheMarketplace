import { Module, Global } from '@nestjs/common';
import { UserService } from '../user/user.service';
import { AuthService } from '../auth/auth.service';

@Global()
@Module({
  providers: [UserService, AuthService],
  exports: [UserService, AuthService],
})
export class SharedModule {}
