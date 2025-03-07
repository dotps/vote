import { Injectable, UnauthorizedException } from "@nestjs/common"
import { UserService } from "../users/user.service"
import { AuthDto } from './auth.dto';
import {TokenService} from "./token.service"

@Injectable()
export class AuthService {

  // constructor(private readonly userService: UserService, private readonly jwtService: JwtService) {
  constructor(private readonly userService: UserService, private readonly tokenService: TokenService) {
  }

  async signIn(username: string, password: string): Promise<AuthDto> {
    const user = await this.userService.getUserByName(username)
    if (user?.password !== password) throw new UnauthorizedException()
    const token =  await this.tokenService.generateToken(user)
    return new AuthDto(user, token)
  }

  // async verifyToken(token: string): Promise<any> {
  //   return this.jwtService.verifyAsync(token)
  // }
  //
  // async generateToken(user: User): Promise<string> {
  //   const payload = { sub: user.id, username: user.name }
  //   const token =  await this.jwtService.signAsync(payload)
  //   if (!token) throw new UnauthorizedException()
  //   return token
  // }
}

