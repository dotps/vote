import { IsEmail, IsNotEmpty, IsOptional, IsString } from "class-validator"
import { ValidationGroup } from "../ValidationGroup"

export class UserDto {
    @IsNotEmpty({ groups: [ValidationGroup.CREATE, ValidationGroup.UPDATE, ValidationGroup.AUTH] })
    @IsOptional({ groups: [ValidationGroup.PARTIAL_UPDATE] })
    @IsString()
    readonly name: string

    @IsNotEmpty({ groups: [ValidationGroup.CREATE, ValidationGroup.UPDATE] })
    @IsOptional({ groups: [ValidationGroup.PARTIAL_UPDATE] })
    @IsEmail()
    readonly email: string

    @IsNotEmpty({ groups: [ValidationGroup.CREATE, ValidationGroup.UPDATE, ValidationGroup.AUTH] })
    @IsOptional({ groups: [ValidationGroup.PARTIAL_UPDATE] })
    @IsString()
    readonly password: string
}