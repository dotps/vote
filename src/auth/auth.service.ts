import {Injectable, UnauthorizedException} from "@nestjs/common"
import {UserService} from "../users/user.service"
import {AuthDto} from "./auth.dto"
import {TokenService} from "./token.service"
import {ErrorsMessages} from "../errors/errors"

@Injectable()
export class AuthService {

    constructor(
        private readonly userService: UserService,
        private readonly tokenService: TokenService
    ) {
    }

    async signIn(username: string, password: string): Promise<AuthDto> {
        const user = await this.userService.getUserByName(username)
        if (user?.password !== password) throw new UnauthorizedException(ErrorsMessages.AuthWrongData)

        const token = await this.tokenService.generateToken(user)

        return new AuthDto(user, token)
    }
}

