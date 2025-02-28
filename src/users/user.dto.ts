import {IsEmail, IsInt, IsNotEmpty, IsString} from "class-validator"
import {Transform} from "class-transformer"

export class UserDto {
    @IsNotEmpty()
    @IsString()
    readonly name: string

    @IsNotEmpty()
    @IsEmail()
    readonly email: string

    @IsNotEmpty()
    @IsString()
    readonly password: string
}