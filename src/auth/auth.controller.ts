import { Body, Controller, Post, HttpCode, HttpStatus, UsePipes, ValidationPipe } from '@nestjs/common';
import { AuthService } from "./auth.service"
import { UserDto, ValidationGroup } from '../users/user.dto';

@Controller("auth")
export class AuthController {

  private authService: AuthService

  constructor(authService: AuthService) {
    this.authService = authService
  }

  @HttpCode(HttpStatus.OK)
  @Post("login")
  @UsePipes(new ValidationPipe({ groups: [ValidationGroup.AUTH] }))
  signIn(@Body() user: UserDto) {
    console.log(user)
    return this.authService.signIn(user.name, user.password)
  }
}
