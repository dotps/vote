import { Module } from '@nestjs/common'
import { AuthService } from './auth.service'
import { AuthController } from './auth.controller'
import { UserModule } from '../users/user.module'
import { UserService } from '../users/user.service';

@Module({
  imports: [UserModule],
  providers: [AuthService],
  controllers: [AuthController],
  // exports: [AuthService],
})

export class AuthModule {}
