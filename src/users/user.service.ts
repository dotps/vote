import { Injectable } from "@nestjs/common"
import { InjectRepository } from "@nestjs/typeorm"
import { Repository } from "typeorm"
import { User } from "./user.entity"
import {UserDto} from "./user.controller"

@Injectable()
export class UserService {

    // @InjectRepository(User)
    // private readonly userRepository: Repository<User>

    constructor(
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
    ) {}

    // constructor(usersRepository: Repository<User>) {
    //     this.userRepository = usersRepository
    // }

    async create(user: UserDto): Promise<User> {
        const newUser = this.userRepository.create(user)
        return await this.userRepository.save(newUser)
    }

    async getAll(): Promise<User[]> {
        return this.userRepository.find()
    }

    async get(id: number): Promise<User | null> {
        return this.userRepository.findOneBy({ id })
    }

    async delete(id: number): Promise<void> {
        await this.userRepository.delete(id)
    }
}
