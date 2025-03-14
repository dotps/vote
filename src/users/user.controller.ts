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

@ApiTags("users")
@Controller("users")
export class UserController {

    constructor(private readonly userService: UserService) {
    }

    @Public()
    @Post()
    @UsePipes(new ValidationPipe({groups: [ValidationGroup.CREATE]}))
    @ApiOperation({summary: "Создание нового пользователя."})
    @ApiResponse({status: 201, description: "Пользователь успешно создан.", type: AuthDto})
    @ApiResponse({status: 400, description: "Неверные данные."})
    @ApiBody({type: UserDto})
    // TODO: продолжить делать документацию swagger
        // TODO: можно ли сделать единый декоратор @ApiCreateUser() для описания api
    async create(@Body() data: UserDto): Promise<AuthDto> {
        return await this.userService.createUser(data)
    }

    @Put(":id")
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
