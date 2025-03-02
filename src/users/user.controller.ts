import { Body, Controller, Param, ParseIntPipe, Patch, Post, Put, UsePipes, ValidationPipe } from '@nestjs/common';
import {UserService} from "./user.service"
import {User} from "./user.entity"
import { UserDto, ValidationGroup } from './user.dto';
import { CustomUpdateUserDto } from './custom-update-user.dto';

@Controller("users")
export class UserController {

    private readonly userService: UserService

    constructor(usersService: UserService) {
        this.userService = usersService
    }

    @Post()
    // @UsePipes(ValidationPipe)
    @UsePipes(new ValidationPipe({ groups: [ValidationGroup.CREATE] }))
    async create(@Body() data: UserDto): Promise<User> {
        console.log(data)
        return await this.userService.create(data)
    }

    // обновляет всю модель
    @Put(":id")
    // @UsePipes(new ValidationPipe({ groups: [ValidationGroup.UPDATE] }))
    // @UsePipes(ValidationPipe)
    // TODO: протестировать как будет работать в 2х вариантах UsePipes
    async update(@Param("id", ParseIntPipe) id: number, @Body() data: UserDto): Promise<User> {
        console.log(id)
        console.log(data)
        return await this.userService.update(id, data)
    }

    // обновляет только переданные поля
    @Patch(":id")
    @UsePipes(new ValidationPipe({ groups: [ValidationGroup.PARTIAL_UPDATE] }))
    async partialUpdate(@Param("id", ParseIntPipe) id: number, @Body() data: UserDto): Promise<void> {
        console.log("custom")
        console.log(id)
        console.log(data)
        await this.userService.update(id, data)
    }
}
