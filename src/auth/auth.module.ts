import { forwardRef, Module } from "@nestjs/common"
import { AuthService } from "./auth.service"
import { AuthController } from "./auth.controller"
import { UserModule } from "../users/user.module"
import { JwtModule } from "@nestjs/jwt"
import { TokenService } from "./token.service"
import { jwtConfig } from "./jwt.config"

@Module({
  imports: [
    forwardRef(() => UserModule),
    JwtModule.registerAsync(jwtConfig),
  ],
  providers: [AuthService, TokenService],
  controllers: [AuthController],
  exports: [AuthService, TokenService],
})

export class AuthModule {
}
