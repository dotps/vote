import { Injectable, UnauthorizedException } from "@nestjs/common"
import { UserService } from "../users/user.service"

@Injectable()
export class AuthService {

  private userService: UserService

  constructor(userService: UserService) {
    this.userService = userService
  }

  async signIn(username: string, pass: string): Promise<any> {
    const user = await this.userService.getUserByName(username)
    console.log(user)
    // TODO: продолжить
    /*
    const user = await this.userService.getUser(username)
    if (user?.password !== pass) {
      throw new UnauthorizedException()
    }
    const { password, ...result } = user
    // TODO: Generate a JWT and return it here
    // instead of the user object
    return result

     */
  }
}
