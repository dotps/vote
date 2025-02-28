import {Body, Controller, Param, ParseIntPipe, Post, Put, UsePipes, ValidationPipe} from "@nestjs/common"
import {UserService} from "./user.service"
import {User} from "./user.entity"
import {UserDto} from "./user.dto"

@Controller("users")
export class UserController {

    private readonly usersService: UserService

    constructor(usersService: UserService) {
        this.usersService = usersService
    }

    @Post()
    @UsePipes(ValidationPipe)
    async create(@Body() data: UserDto): Promise<User> {
        console.log(data)
        return await this.usersService.create(data)
    }

    // обновляет всю модель
    @Put(":id")
    @UsePipes(ValidationPipe)
    async update(@Param("id", ParseIntPipe) id: number, @Body() data: UserDto): Promise<User> {
        console.log(id)
        console.log(data)
        return await this.usersService.update(id, data)
    }

    // обновляет только переданные поля
    // TODO: разобраться как можно реализовать обновление части полей в UserDto, ValidationType не работает с Partial<UserDto>
    @Put(":id/custom")
    @UsePipes(ValidationPipe)
    async customUpdate(@Param("id", ParseIntPipe) id: number, @Body() data: UserDto): Promise<void> {
        // TODO: попробовать plainToClass
        // const validatedData = plainToClass(UserDto, data, { excludeExtraneousValues: true })
        console.log("custom")
        console.log(id)
        console.log(data)
        // return await this.usersService.update(id, data)
    }
}
