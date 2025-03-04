import { Injectable, UnauthorizedException } from "@nestjs/common"
import { UserService } from "../users/user.service"
import { JwtService } from '@nestjs/jwt';
import { AuthDto } from './auth.dto';

@Injectable()
export class AuthService {

  private userService: UserService
  private jwtService: JwtService

  constructor(userService: UserService, jwtService: JwtService) {
    this.userService = userService
    this.jwtService = jwtService
  }

  async signIn(username: string, password: string): Promise<AuthDto> {
    const user = await this.userService.getUserByName(username)
    if (user?.password !== password) throw new UnauthorizedException()

    const payload = { sub: user.id, username: user.name }
    const token =  await this.jwtService.signAsync(payload)
    if (!token) throw new UnauthorizedException()

    return new AuthDto(user, token)
  }

  async verifyToken(token: string): Promise<any> {
    return this.jwtService.verifyAsync(token)
  }
}

