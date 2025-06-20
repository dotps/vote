import {Injectable, UnauthorizedException} from "@nestjs/common"
import {JwtService} from "@nestjs/jwt"
import {User} from "../users/user.entity"
import {ErrorsMessages} from "../errors/errors"

@Injectable()
export class TokenService {

    constructor(private readonly jwtService: JwtService) {
    }

    async verifyToken(token: string): Promise<any> {
        return this.jwtService.verifyAsync(token)
    }

    async generateToken(user: User): Promise<string> {
        const payload = {sub: user.id, username: user.name}
        const token = await this.jwtService.signAsync(payload)
        if (!token) throw new UnauthorizedException(ErrorsMessages.AuthTokenNotFound)
        return token
    }
}