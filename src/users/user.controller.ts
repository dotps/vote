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
import {ApiTags} from "@nestjs/swagger"
import {ApiCreateUser, ApiPartialUpdateUser, ApiUpdateUser} from "../swagger.decorator"

@Controller("users")
@ApiTags("users")
export class UserController {

    constructor(private readonly userService: UserService) {
    }

    @Public()
    @Post()
    @UsePipes(new ValidationPipe({groups: [ValidationGroup.CREATE]}))
    @ApiCreateUser()
    async create(@Body() data: UserDto): Promise<AuthDto> {
        return await this.userService.createUser(data)
    }

    @Put(":id")
    @UsePipes(new ValidationPipe({groups: [ValidationGroup.UPDATE]}))
    @ApiUpdateUser()
    async update(
        @Param("id", ParseIntPipe) id: number,
        @Body() data: UserDto,
        @CurrentUser() user: User,
    ): Promise<User> {
        if (!user.isSelf(id)) throw new ForbiddenException(ErrorsMessages.USER_UPDATE_FORBIDDEN)
        return this.userService.updateUser(id, data)
    }

    @Patch(":id")
    @UsePipes(new ValidationPipe({groups: [ValidationGroup.PARTIAL_UPDATE]}))
    @ApiPartialUpdateUser()
    async partialUpdate(
        @Param("id", ParseIntPipe) id: number,
        @Body() data: UserDto,
        @CurrentUser() user: User,
    ): Promise<User> {
        if (!user.isSelf(id)) throw new ForbiddenException(ErrorsMessages.USER_UPDATE_FORBIDDEN)
        return this.userService.updateUser(id, data)
    }
}
