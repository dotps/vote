import { IsEmail, IsNotEmpty, IsOptional, IsString } from "class-validator"
import { ValidationGroup } from "../validation/ValidationGroup"
import {ApiProperty} from "@nestjs/swagger"

export class UserDto {
    @IsNotEmpty({ groups: [ValidationGroup.CREATE, ValidationGroup.UPDATE, ValidationGroup.AUTH] })
    @IsOptional({ groups: [ValidationGroup.PARTIAL_UPDATE] })
    @IsString()
    @ApiProperty({ description: "Имя, обязательно для CREATE, UPDATE, AUTH методов." })
    readonly name: string

    @IsNotEmpty({ groups: [ValidationGroup.CREATE, ValidationGroup.UPDATE] })
    @IsOptional({ groups: [ValidationGroup.PARTIAL_UPDATE] })
    @IsEmail()
    @ApiProperty({ description: "E-mail, обязательно для CREATE, UPDATE методов." })
    readonly email: string

    @IsNotEmpty({ groups: [ValidationGroup.CREATE, ValidationGroup.UPDATE, ValidationGroup.AUTH] })
    @IsOptional({ groups: [ValidationGroup.PARTIAL_UPDATE] })
    @IsString()
    @ApiProperty({ description: "Пароль, обязательно для CREATE, UPDATE, AUTH методов." })
    readonly password: string
}