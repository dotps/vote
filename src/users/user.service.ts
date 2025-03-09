import { BadRequestException, Inject, Injectable, NotFoundException, UnauthorizedException } from "@nestjs/common"
import { InjectRepository } from "@nestjs/typeorm"
import {Repository, UpdateResult} from "typeorm"
import { User } from "./user.entity"
import {UserDto} from "./user.dto"
import {AuthService} from "../auth/auth.service"
import {AuthDto} from "../auth/auth.dto"
import {TokenService} from "../auth/token.service"

@Injectable()
export class UserService {

    constructor(
        @InjectRepository(User)
        private readonly repository: Repository<User>,
        // private readonly authService: AuthService
        private readonly tokenService: TokenService
    ) {}

    async createUser(data: UserDto): Promise<AuthDto> {
        let user = this.repository.create(data)
        user = await this.repository.save(user)
        // TODO: здесь ошибка
        const token = await this.tokenService.generateToken(user)
        return new AuthDto(user, token)
        // return
    }

    async getAll(): Promise<User[]> {
        return this.repository.find()
    }

    async getUser(id: number): Promise<User | null> {
        const user = await this.repository.findOneBy({ id })
        if (!user) throw new NotFoundException()
        return user
    }

    async getUserByName(name: string): Promise<User | null> {
        return this.repository.findOneBy({ name: name.trim() })
    }

    async deleteUser(id: number): Promise<void> {
        const result = await this.repository.delete(id)
        if (!result.affected) throw new NotFoundException(`Запись с id=${id} не найдена.`)
    }

    async updateUser(id: number, data: UserDto): Promise<User> {
        const result = await this.repository.update(id, data)
        if (!result.affected) throw new NotFoundException(`Запись с id=${id} не найдена.`)
        return await this.getUser(id)
    }
}
