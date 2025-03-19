import {CanActivate, ExecutionContext, Injectable, UnauthorizedException} from "@nestjs/common"
import {Request} from "express"
import {Reflector} from "@nestjs/core"
import {IS_PUBLIC_KEY} from "./public.decorator"
import {TokenService} from "./token.service"
import {UserService} from "../users/user.service"
import {ErrorsMessages} from "../errors/errors"

@Injectable()
export class AuthGuard implements CanActivate {

    constructor(
        private readonly tokenService: TokenService,
        private readonly reflector: Reflector,
        private readonly userService: UserService,
    ) {
    }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        if (this.hasPublicDecorator(context)) return true

        const request = context.switchToHttp().getRequest()
        const token = this.getTokenFromHeader(request)
        if (!token) throw new UnauthorizedException(ErrorsMessages.AUTH_TOKEN_NOT_FOUND)

        try {
            const userId = await this.getUserIdFromToken(token)
            request.user = await this.userService.getUser(userId)
        } catch {
            throw new UnauthorizedException()
        }
        return true
    }

    private hasPublicDecorator(context: ExecutionContext): boolean {
        return this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
            context.getHandler(),
            context.getClass(),
        ])
    }

    async getUserIdFromToken(token: string): Promise<number> {
        const decodedToken = await this.tokenService.verifyToken(token)
        const userId = Number(decodedToken.sub) || undefined
        if (!userId) throw new UnauthorizedException(ErrorsMessages.AUTH_TOKEN_USER_NOT_FOUND)
        return userId
    }

    private getTokenFromHeader(request: Request): string | undefined {
        const [type, token] = request.headers.authorization?.split(" ") ?? []
        return type === "Bearer" ? token : undefined
    }
}
