import { Body, Controller, Param, ParseIntPipe, Patch, Post, Put, UsePipes, ValidationPipe } from "@nestjs/common"
import { UserService } from "./user.service"
import { User } from "./user.entity"
import { UserDto } from "./user.dto"
import { Public } from "../auth/public.decorator"
import { ValidationGroup } from "../ValidationGroup"
import {AuthService} from "../auth/auth.service"
import {AuthDto} from "../auth/auth.dto"

@Controller("users")
export class UserController {

    constructor(private readonly userService: UserService) {
    }

    @Public()
    @Post()
    @UsePipes(new ValidationPipe({ groups: [ValidationGroup.CREATE] }))
    async create(@Body() data: UserDto): Promise<AuthDto> {
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
