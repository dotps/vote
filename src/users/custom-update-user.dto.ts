import { IsEmail, IsNotEmpty, IsOptional, IsString } from 'class-validator';

// TODO: IsOptional - работает для частичного обновления модели
export class CustomUpdateUserDto {
    @IsOptional()
    @IsString()
    readonly name: string

    @IsOptional()
    @IsEmail()
    readonly email: string

    @IsOptional()
    @IsString()
    readonly password: string
}