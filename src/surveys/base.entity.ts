import {CreateDateColumn, PrimaryGeneratedColumn, UpdateDateColumn} from "typeorm"
import {ApiProperty} from "@nestjs/swagger"

export abstract class BaseEntity {
    @PrimaryGeneratedColumn()
    @ApiProperty({description: "ID"})
    id: number

    @CreateDateColumn()
    @ApiProperty({description: "Дата создания"})
    createdAt: Date

    @UpdateDateColumn()
    @ApiProperty({description: "Дата обновления"})
    updatedAt: Date
}