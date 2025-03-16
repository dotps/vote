import {
    Body,
    Controller,
    ForbiddenException,
    Param,
    ParseIntPipe,
    Patch,
    Post,
    Put,
    UsePipes,
    ValidationPipe
} from "@nestjs/common"
import {UserService} from "./user.service"
import {User} from "./user.entity"
import {UserDto} from "./user.dto"
import {Public} from "../auth/public.decorator"
import {ValidationGroup} from "../validation/ValidationGroup"
import {AuthDto} from "../auth/auth.dto"
import {CurrentUser} from "./current-user.decorator"
import {ErrorsMessages} from "../errors/errors"
import {ApiBody, ApiOperation, ApiResponse, ApiTags} from "@nestjs/swagger"
import { ApiCreateUser } from "../swagger.decorator"

@Controller("users")
@ApiTags("users")
export class UserController {

    constructor(private readonly userService: UserService) {
    }

    @Public()
    @Post()
    @UsePipes(new ValidationPipe({groups: [ValidationGroup.CREATE]}))
    @ApiCreateUser()
    // TODO: продолжить делать документацию swagger
    async create(@Body() data: UserDto): Promise<AuthDto> {
        return await this.userService.createUser(data)
    }

    @Put(":id")
    @ApiResponse({ status: 401, description: "Требуется авторизация." })
    @UsePipes(new ValidationPipe({groups: [ValidationGroup.UPDATE]}))
    async update(
        @Param("id", ParseIntPipe) id: number,
        @Body() data: UserDto,
        @CurrentUser() user: User,
    ): Promise<User> {
        if (user.id !== id) throw new ForbiddenException(ErrorsMessages.USER_UPDATE_FORBIDDEN)
        return this.userService.updateUser(id, data)
    }

    @Patch(":id")
    @ApiResponse({ status: 401, description: "Требуется авторизация." })
    @UsePipes(new ValidationPipe({groups: [ValidationGroup.PARTIAL_UPDATE]}))
    async partialUpdate(
        @Param("id", ParseIntPipe) id: number,
        @Body() data: UserDto,
        @CurrentUser() user: User,
    ): Promise<User> {
        if (user.id !== id) throw new ForbiddenException(ErrorsMessages.USER_UPDATE_FORBIDDEN)
        return this.userService.updateUser(id, data)
    }
}
