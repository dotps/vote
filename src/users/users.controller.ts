import {Body, Controller, Post} from "@nestjs/common"

export class UserDto {
    readonly id?: number
    readonly name?: string
    readonly email?: string
    readonly password?: string

    constructor(data: Partial<UserDto>) {
        this.id = Number(data?.id) || undefined
        this.name = data?.name ? data.name.toString() : undefined
        this.email = data?.email ? data.email.toString() : undefined
        this.password = data?.password ? data.password.toString() : undefined
    }
}

@Controller("users")
export class UsersController {

    @Post()
    create(@Body() data: Partial<UserDto>) {
        const userData = new UserDto(data)
        // TODO: реализовать валидацию через class-validator, ValidationPipe
        console.log(data)
        console.log(userData)
        // return this.usersService.create(userDto)
    }
}
