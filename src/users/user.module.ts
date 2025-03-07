import {forwardRef, Module} from "@nestjs/common"
import { TypeOrmModule } from "@nestjs/typeorm"
import { UserService } from "./user.service"
import { UserController } from "./user.controller"
import { User } from "./user.entity"
import {AuthService} from "../auth/auth.service"
import {AuthModule} from "../auth/auth.module"
import {TokenService} from "../auth/token.service"
import {JwtService} from "@nestjs/jwt"

@Module({
    imports: [
        TypeOrmModule.forFeature([User]),
        // forwardRef(() => AuthModule),
        // AuthModule,
    ],
    providers: [
        UserService,
        // AuthService
        TokenService,
        JwtService
    ],
    controllers: [UserController],
    exports: [UserService]
})

export class UserModule {}
