import { Injectable, UnauthorizedException } from "@nestjs/common"
import { UserService } from "../users/user.service"
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {

  private userService: UserService
  private jwtService: JwtService

  constructor(userService: UserService, jwtService: JwtService) {
    this.userService = userService
    this.jwtService = jwtService
  }

  async signIn(username: string, pass: string): Promise<any> {
    const user = await this.userService.getUserByName(username)
    if (user?.password !== pass) throw new UnauthorizedException()
    const payload = { sub: user.id, username: user.name }
    // TODO: сделать тип для ответа
    return {
      token: await this.jwtService.signAsync(payload)
    }
  }
}
