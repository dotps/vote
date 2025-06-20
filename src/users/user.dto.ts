import {IsEmail, IsNotEmpty, IsOptional, IsString} from "class-validator"
import {ApiProperty} from "@nestjs/swagger"
import { ValidationGroup } from "src/validation/validation-group"

export class UserDto {
    @IsNotEmpty({groups: [ValidationGroup.Create, ValidationGroup.Update, ValidationGroup.Auth]})
    @IsOptional({groups: [ValidationGroup.PartialUpdate]})
    @IsString()
    @ApiProperty({description: "Имя, обязательно для CREATE, UPDATE, AUTH методов."})
    readonly name: string

    @IsNotEmpty({groups: [ValidationGroup.Create, ValidationGroup.Update]})
    @IsOptional({groups: [ValidationGroup.PartialUpdate]})
    @IsEmail()
    @ApiProperty({description: "E-mail, обязательно для CREATE, UPDATE методов."})
    readonly email: string

    @IsNotEmpty({groups: [ValidationGroup.Create, ValidationGroup.Update, ValidationGroup.Auth]})
    @IsOptional({groups: [ValidationGroup.PartialUpdate]})
    @IsString()
    @ApiProperty({description: "Пароль, обязательно для CREATE, UPDATE, AUTH методов."})
    readonly password: string
}