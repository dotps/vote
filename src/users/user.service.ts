import {Injectable, NotFoundException} from "@nestjs/common"
import {InjectRepository} from "@nestjs/typeorm"
import {Repository} from "typeorm"
import {User} from "./user.entity"
import {UserDto} from "./user.dto"
import {AuthDto} from "../auth/auth.dto"
import {TokenService} from "../auth/token.service"
import {ErrorsMessages, Errors} from "../errors/errors"

@Injectable()
export class UserService {

    constructor(
        @InjectRepository(User)
        private readonly repository: Repository<User>,
        private readonly tokenService: TokenService
    ) {
    }

    async createUser(data: UserDto): Promise<AuthDto> {
        let user = this.repository.create(data)
        user = await this.repository.save(user)
        const token = await this.tokenService.generateToken(user)
        return new AuthDto(user, token)
    }

    async getUser(id: number): Promise<User> {
        const user = await this.repository.findOneBy({id})
        if (!user) throw new NotFoundException(Errors.displayId(id) + ErrorsMessages.USER_NOT_FOUND)
        return user
    }

    async getUserByName(name: string): Promise<User> {
        const user = await this.repository.findOneBy({name: name.trim()})
        if (!user) throw new NotFoundException(ErrorsMessages.USER_NOT_FOUND)
        return user
    }

    async updateUser(id: number, data: UserDto): Promise<User> {
        const result = await this.repository.update(id, data)
        if (!result.affected) throw new NotFoundException(Errors.displayId(id) + ErrorsMessages.NOT_FOUND)
        return await this.getUser(id)
    }

    async getAll(): Promise<User[]> {
        return this.repository.find()
    }

    async deleteUser(id: number): Promise<void> {
        const result = await this.repository.delete(id)
        if (!result.affected) throw new NotFoundException(Errors.displayId(id) + ErrorsMessages.NOT_FOUND)
    }
}