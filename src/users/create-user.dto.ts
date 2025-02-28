// export class UserDto {
//     readonly id?: number
//     readonly name?: string
//     readonly email?: string
//     readonly password?: string
//
//     constructor(data: UserDto) {
//         this.id = Number(data?.id) || undefined
//         this.name = data?.name ? data.name.toString() : undefined
//         this.email = data?.email ? data.email.toString() : undefined
//         this.password = data?.password ? data.password.toString() : undefined
//     }
// }

import {IsInt} from "class-validator"
import {Transform} from "class-transformer"
import {UserDto} from "./user.dto"

export class CreateUserDto extends UserDto {

}