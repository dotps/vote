import { User } from "../users/user.entity"

export class AuthDto {
  readonly token: string

  constructor(user: User, token: string) {
    this.token = token
  }
}