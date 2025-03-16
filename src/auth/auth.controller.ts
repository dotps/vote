import { Body, Controller, Post, HttpCode, HttpStatus, UsePipes, ValidationPipe, Get, UseGuards, Request } from "@nestjs/common"
import { AuthService } from "./auth.service"
import { UserDto } from "../users/user.dto"
import { AuthGuard } from "./auth.guard"
import { Public } from "./public.decorator"
import { ValidationGroup } from "../validation/ValidationGroup"
import {CurrentUser} from "../users/current-user.decorator"
import {User} from "../users/user.entity"
import { ApiResponse, ApiTags } from "@nestjs/swagger"
import { ApiAuthLogin } from "../swagger.decorator"
import { AuthDto } from "./auth.dto"

@Controller("auth")
@ApiTags("auth")
export class AuthController {

  constructor(private readonly authService: AuthService) {
  }

  @Public()
  @HttpCode(HttpStatus.OK)
  @Post("login")
  @UsePipes(new ValidationPipe({ groups: [ValidationGroup.AUTH] }))
  @ApiAuthLogin()
  signIn(@Body() user: UserDto): Promise<AuthDto> {
    return this.authService.signIn(user.name, user.password)
  }

  @Get("profile")
  @ApiResponse({ status: 200, description: "Данные пользователя.", type: User })
  @ApiResponse({ status: 401, description: "Требуется авторизация." })
  getProfile(@CurrentUser() user: User): User {
    // TODO: добавить dto много лишнего отдается
    return user
  }
}
