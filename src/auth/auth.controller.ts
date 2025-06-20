import {
    Body,
    Controller,
    Post,
    HttpCode,
    HttpStatus,
    UsePipes,
    ValidationPipe,
    Get,
} from "@nestjs/common"
import {AuthService} from "./auth.service"
import {UserDto} from "../users/user.dto"
import {Public} from "./public.decorator"
import {CurrentUser} from "../users/current-user.decorator"
import {User} from "../users/user.entity"
import {ApiTags} from "@nestjs/swagger"
import {ApiAuthLogin, ApiAuthProfile} from "../swagger.decorator"
import {AuthDto} from "./auth.dto"
import {ValidationGroup} from "../validation/validation-group"

@Controller("auth")
@ApiTags("auth")
export class AuthController {

    constructor(private readonly authService: AuthService) {
    }

    @Public()
    @HttpCode(HttpStatus.OK)
    @Post("login")
    @UsePipes(new ValidationPipe({groups: [ValidationGroup.AUTH]}))
    @ApiAuthLogin()
    signIn(@Body() user: UserDto): Promise<AuthDto> {
        return this.authService.signIn(user.name, user.password)
    }

    @Get("profile")
    @ApiAuthProfile()
    getProfile(@CurrentUser() user: User): User {
        return user
    }
}
