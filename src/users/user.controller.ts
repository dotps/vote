import {Body, Controller, Param, ParseIntPipe, Post, Put, UsePipes, ValidationPipe} from "@nestjs/common"
import {UserService} from "./user.service"
import {User} from "./user.entity"
import {CreateUserDto} from "./create-user.dto"
import {UserDto} from "./user.dto"
import {UpdateResult} from "typeorm"

@Controller("users")
export class UserController {

    private readonly usersService: UserService

    constructor(usersService: UserService) {
        this.usersService = usersService
    }

    @Post()
    @UsePipes(new ValidationPipe({transform: true, whitelist: true}))
    create(@Body() data: UserDto): Promise<User> {
        console.log(data)
        return this.usersService.create(data)
    }

    @Put(":id")
    @UsePipes(new ValidationPipe({transform: true, whitelist: true}))
    update(@Param("id", new ParseIntPipe()) id: number, @Body() data: UserDto): Promise<boolean> {
        console.log(id)
        console.log(data)
        const isUpdated = this.usersService.update(id, data)
        return isUpdated
    }


}
