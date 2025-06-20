import {Entity, Column, PrimaryGeneratedColumn, OneToMany} from "typeorm"
import {SurveyResult} from "../../libs/entities/survey-result.entity"
import {ApiProperty} from "@nestjs/swagger"

@Entity()
export class User {
    @PrimaryGeneratedColumn()
    @ApiProperty({description: "ID пользователя"})
    readonly id: number

    @Column()
    @ApiProperty({description: "Имя"})
    readonly name: string

    @Column()
    @ApiProperty({description: "E-mail"})
    readonly email: string

    @Column()
    @ApiProperty({description: "Пароль"})
    readonly password: string

    @OneToMany(() => SurveyResult, (result) => result.user)
    surveyResults: SurveyResult[]

    isSelf(id: number): boolean {
        return this.id === id
    }
}