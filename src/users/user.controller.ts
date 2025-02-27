import {Body, Controller, Post} from "@nestjs/common"
import {UserService} from "./user.service"
import {User} from "./user.entity"

export class UserDto {
    readonly id?: number
    readonly name?: string
    readonly email?: string
    readonly password?: string

    constructor(data: UserDto) {
        this.id = Number(data?.id) || undefined
        this.name = data?.name ? data.name.toString() : undefined
        this.email = data?.email ? data.email.toString() : undefined
        this.password = data?.password ? data.password.toString() : undefined
    }
}

@Controller("users")
export class UserController {

    private readonly usersService: UserService

    constructor(usersService: UserService) {
        this.usersService = usersService
    }

    @Post()
    create(@Body() data: UserDto) {
        const userData = new UserDto(data)
        // TODO: реализовать валидацию через class-validator, ValidationPipe
        // https://dev.to/davidekete/understanding-data-transfer-objects-dto-and-data-validation-in-typescript-nestjs-1j2b
        return this.usersService.create(userData)
    }
}
