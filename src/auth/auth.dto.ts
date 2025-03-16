import { User } from "../users/user.entity"
import { ApiProperty } from "@nestjs/swagger"

export class AuthDto {
  @ApiProperty({ description: "Токен" })
  readonly token: string

  constructor(user: User, token: string) {
    this.token = token
  }
}