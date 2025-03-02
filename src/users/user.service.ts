import {BadRequestException, Injectable, NotFoundException} from "@nestjs/common"
import { InjectRepository } from "@nestjs/typeorm"
import {Repository, UpdateResult} from "typeorm"
import { User } from "./user.entity"
import {UserDto} from "./user.dto"

@Injectable()
export class UserService {

    // @InjectRepository(User)
    // private readonly userRepository: Repository<User>

    constructor(
        @InjectRepository(User)
        private readonly repository: Repository<User>,
    ) {}

    // constructor(usersRepository: Repository<User>) {
    //     this.userRepository = usersRepository
    // }

    async create(user: UserDto): Promise<User> {
        const newUser = this.repository.create(user)
        return await this.repository.save(newUser)
    }

    async getAll(): Promise<User[]> {
        return this.repository.find()
    }

    async get(id: number): Promise<User | null> {
        return this.repository.findOneBy({ id })
    }

    async delete(id: number): Promise<void> {
        await this.repository.delete(id)
    }

    async update(id: number, data: UserDto): Promise<User> {
        const result = await this.repository.update(id, data)
        if (!result.affected) throw new NotFoundException(`Запись с id=${id} не найдена.`)
        return await this.get(id)
    }
}
