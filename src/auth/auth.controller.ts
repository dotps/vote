import { Body, Controller, Post, HttpCode, HttpStatus, UsePipes, ValidationPipe, Get, UseGuards, Request } from "@nestjs/common"
import { AuthService } from "./auth.service"
import { UserDto } from "../users/user.dto"
import { AuthGuard } from "./auth.guard"
import { Public } from "./public.decorator"
import { ValidationGroup } from "../ValidationGroup"

@Controller("auth")
export class AuthController {

  private authService: AuthService

  constructor(authService: AuthService) {
    this.authService = authService
  }

  @Public()
  @HttpCode(HttpStatus.OK)
  @Post("login")
  @UsePipes(new ValidationPipe({ groups: [ValidationGroup.AUTH] }))
  signIn(@Body() user: UserDto) {
    return this.authService.signIn(user.name, user.password)
  }

  // @UseGuards(AuthGuard)
  @Get("profile")
  getProfile(@Request() request) {
    return request.user
  }
}
