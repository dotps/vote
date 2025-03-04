import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from "@nestjs/common"
import { Request } from "express"
import { AuthService } from "./auth.service"
import { Reflector } from "@nestjs/core"
import { IS_PUBLIC_KEY } from "./public.decorator"

@Injectable()
export class AuthGuard implements CanActivate {

  constructor(private authService: AuthService, private reflector: Reflector) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {

    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ])
    if (isPublic) return true

    const request = context.switchToHttp().getRequest()
    const token = this.getTokenFromHeader(request)
    if (!token) throw new UnauthorizedException()

    try {
      request["user"] = await this.authService.verifyToken(token)
    } catch {
      throw new UnauthorizedException()
    }
    return true
  }

  private getTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(" ") ?? []
    return type === "Bearer" ? token : undefined
  }
}
