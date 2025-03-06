import { Body, Controller, Param, ParseIntPipe, Patch, Post, Put, UsePipes, ValidationPipe } from "@nestjs/common"
import { UserService } from "./user.service"
import { User } from "./user.entity"
import { UserDto } from "./user.dto"
import { Public } from "../auth/public.decorator"
import { ValidationGroup } from "../ValidationGroup"

@Controller("users")
export class UserController {

    private readonly userService: UserService

    constructor(usersService: UserService) {
        this.userService = usersService
    }

    @Public()
    @Post()
    @UsePipes(new ValidationPipe({ groups: [ValidationGroup.CREATE] }))
    async create(@Body() data: UserDto): Promise<User> {
        // TODO: уйти от групп в сторону нескольких dto + интерфейсы для них, см. survey
        return await this.userService.createUser(data)
    }

    @Put(":id")
    @UsePipes(new ValidationPipe({ groups: [ValidationGroup.UPDATE] }))
    async update(@Param("id", ParseIntPipe) id: number, @Body() data: UserDto): Promise<User> {
        return this.userService.updateUser(id, data)
    }

    @Patch(":id")
    @UsePipes(new ValidationPipe({ groups: [ValidationGroup.PARTIAL_UPDATE] }))
    async partialUpdate(@Param("id", ParseIntPipe) id: number, @Body() data: UserDto): Promise<User> {
        return this.userService.updateUser(id, data)
    }
}
