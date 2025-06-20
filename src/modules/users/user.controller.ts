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
import {Public} from "../../libs/decorators/public.decorator"
import {AuthDto} from "../auth/auth.dto"
import {CurrentUser} from "../../libs/decorators/current-user.decorator"
import {ErrorsMessages} from "../../libs/errors/errors"
import {ApiTags} from "@nestjs/swagger"
import {ApiCreateUser, ApiPartialUpdateUser, ApiUpdateUser} from "../../libs/decorators/swagger.decorator"
import {ValidationGroup} from "../../libs/validation/validation-group"

@Controller("users")
@ApiTags("users")
export class UserController {

    constructor(private readonly userService: UserService) {
    }

    @Public()
    @Post()
    @UsePipes(new ValidationPipe({groups: [ValidationGroup.Create]}))
    @ApiCreateUser()
    async create(@Body() data: UserDto): Promise<AuthDto> {
        return await this.userService.createUser(data)
    }

    @Put(":id")
    @UsePipes(new ValidationPipe({groups: [ValidationGroup.Update]}))
    @ApiUpdateUser()
    async update(
        @Param("id", ParseIntPipe) id: number,
        @Body() data: UserDto,
        @CurrentUser() user: User,
    ): Promise<User> {
        if (!user.isSelf(id)) throw new ForbiddenException(ErrorsMessages.UserUpdateForbidden)
        return this.userService.updateUser(id, data)
    }

    @Patch(":id")
    @UsePipes(new ValidationPipe({groups: [ValidationGroup.PartialUpdate]}))
    @ApiPartialUpdateUser()
    async partialUpdate(
        @Param("id", ParseIntPipe) id: number,
        @Body() data: UserDto,
        @CurrentUser() user: User,
    ): Promise<User> {
        if (!user.isSelf(id)) throw new ForbiddenException(ErrorsMessages.UserUpdateForbidden)
        return this.userService.updateUser(id, data)
    }
}
