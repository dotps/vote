import {Entity, PrimaryGeneratedColumn, Column, OneToMany, CreateDateColumn, UpdateDateColumn} from "typeorm"
import {Question} from "./question.entity"
import {SurveyResult} from "./survey-result.entity"
import {ApiProperty} from "@nestjs/swagger"
import {BaseEntity} from "./base.entity"

@Entity()
export class Survey extends BaseEntity {
    @Column()
    @ApiProperty({description: "Заголовок"})
    title: string

    @Column()
    @ApiProperty({description: "Текст опроса"})
    description: string

    @OneToMany(() => Question, (question) => question.survey, {
        cascade: true,
        onDelete: "CASCADE"
    })
    @ApiProperty({
        description: "Массив объектов с вопросами",
        isArray: true,
        type: () => Question,
    })
    questions: Question[]

    @OneToMany(() => SurveyResult, (result) => result.survey)
    results: SurveyResult[]

    @Column()
    @ApiProperty({description: "ID пользователя создавшего опрос"})
    createdBy: number

    @Column({default: true})
    @ApiProperty({description: "Доступен ли опрос для пользователей"})
    enabled: boolean
}