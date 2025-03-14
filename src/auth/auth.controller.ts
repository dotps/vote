import { Body, Controller, Post, HttpCode, HttpStatus, UsePipes, ValidationPipe, Get, UseGuards, Request } from "@nestjs/common"
import { AuthService } from "./auth.service"
import { UserDto } from "../users/user.dto"
import { AuthGuard } from "./auth.guard"
import { Public } from "./public.decorator"
import { ValidationGroup } from "../ValidationGroup"
import {CurrentUser} from "../users/current-user.decorator"
import {User} from "../users/user.entity"

@Controller("auth")
export class AuthController {

  constructor(private readonly authService: AuthService) {
  }

  @Public()
  @HttpCode(HttpStatus.OK)
  @Post("login")
  @UsePipes(new ValidationPipe({ groups: [ValidationGroup.AUTH] }))
  signIn(@Body() user: UserDto) {
    return this.authService.signIn(user.name, user.password)
  }

  @Get("profile")
  getProfile(@CurrentUser() user: User) {
    return user
  }
}
