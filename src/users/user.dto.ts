import { IsEmail, IsEmpty, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { RemoveFromGroups } from './remove-from-groups.transformer';

export enum ValidationGroup {
    AUTH = "AUTH",
    CREATE = "CREATE",
    UPDATE = "UPDATE",
    PARTIAL_UPDATE = "PARTIAL_UPDATE",
}

export class UserDto {
    @IsNotEmpty({ groups: [ValidationGroup.CREATE, ValidationGroup.UPDATE, ValidationGroup.AUTH] })
    @IsOptional({ groups: [ValidationGroup.PARTIAL_UPDATE] })
    @IsString()
    readonly name: string

    @RemoveFromGroups([ValidationGroup.AUTH])
    @IsNotEmpty({ groups: [ValidationGroup.CREATE, ValidationGroup.UPDATE] })
    @IsOptional({ groups: [ValidationGroup.PARTIAL_UPDATE] })
    @IsEmail()
    readonly email: string

    @IsNotEmpty({ groups: [ValidationGroup.CREATE, ValidationGroup.UPDATE, ValidationGroup.AUTH] })
    @IsOptional({ groups: [ValidationGroup.PARTIAL_UPDATE] })
    @IsString()
    readonly password: string
}