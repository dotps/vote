import { IsEmail, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export enum ValidationGroup {
    CREATE = "CREATE",
    UPDATE = "UPDATE",
    PARTIAL_UPDATE = "PARTIAL_UPDATE",
}

export class UserDto {
    // TODO: добавить группу для авторизации обязательно name и password
    @IsNotEmpty({ groups: [ValidationGroup.CREATE, ValidationGroup.UPDATE] })
    @IsOptional({ groups: [ValidationGroup.PARTIAL_UPDATE] })
    @IsString()
    readonly name: string

    @IsNotEmpty({ groups: [ValidationGroup.CREATE, ValidationGroup.UPDATE] })
    @IsOptional({ groups: [ValidationGroup.PARTIAL_UPDATE] })
    @IsEmail()
    readonly email: string

    @IsNotEmpty({ groups: [ValidationGroup.CREATE, ValidationGroup.UPDATE] })
    @IsOptional({ groups: [ValidationGroup.PARTIAL_UPDATE] })
    @IsString()
    readonly password: string
}