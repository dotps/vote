import { Body, Controller, Param, ParseIntPipe, Patch, Post, Put, UsePipes, ValidationPipe } from '@nestjs/common';
import { UserService } from './user.service';
import { User } from './user.entity';
import { UserDto, ValidationGroup } from './user.dto';

@Controller("users")
export class UserController {

    private readonly userService: UserService

    constructor(usersService: UserService) {
        this.userService = usersService
    }

    @Post()
    @UsePipes(new ValidationPipe({ groups: [ValidationGroup.CREATE] }))
    async create(@Body() data: UserDto): Promise<User> {
        const user = await this.userService.createUser(data)
        console.log(user.id);
        return user
        // return this.userService.createUser(data)
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
