import {forwardRef, Module} from "@nestjs/common"
import { AuthService } from './auth.service'
import { AuthController } from './auth.controller'
import { UserModule } from '../users/user.module'
import {JwtModule, JwtService} from "@nestjs/jwt"
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Config } from '../config/config';
import {TokenService} from "./token.service"

@Module({
  imports: [
    // forwardRef(() => UserModule),
    UserModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        global: true,
        secret: configService.get<string>(Config.JWT_SECRET),
        signOptions: { expiresIn: configService.get<string>(Config.JWT_EXPIRES) },
      }),
      inject: [ConfigService],
    }),
  ],
  providers: [AuthService, TokenService],
  controllers: [AuthController],
  exports: [AuthService, TokenService],
})

export class AuthModule {}
