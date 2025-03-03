import {BadRequestException, Injectable, NotFoundException} from "@nestjs/common"
import { InjectRepository } from "@nestjs/typeorm"
import {Repository, UpdateResult} from "typeorm"
import { User } from "./user.entity"
import {UserDto} from "./user.dto"

@Injectable()
export class UserService {

    constructor(
        @InjectRepository(User)
        private readonly repository: Repository<User>,
    ) {}

    async createUser(user: UserDto): Promise<User> {
        const newUser = this.repository.create(user)
        return await this.repository.save(newUser)
    }

    async getAll(): Promise<User[]> {
        return this.repository.find()
    }

    async getUser(id: number): Promise<User | null> {
        return this.repository.findOneBy({ id })
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
