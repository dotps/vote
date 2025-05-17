import {User} from "../users/user.entity"
import {ApiProperty} from "@nestjs/swagger"

export class AuthDto {
    @ApiProperty({description: "Токен"})
    readonly token: string

    // TODO: неиросеть добавила закоментированное, посмотреть как это влияет на тесты и работу приложения
    // @ApiProperty({description: "Данные пользователя", type: User})
    // readonly user: User

    constructor(user: User, token: string) {
        this.token = token
        // this.user = user
    }
}