import {Entity, PrimaryGeneratedColumn, Column, OneToMany, CreateDateColumn, UpdateDateColumn} from "typeorm"
import {Question} from "../question/question.entity"
import {SurveyResult} from "./survey-result.entity"
import {ApiProperty} from "@nestjs/swagger"

@Entity()
export class Survey {
    @PrimaryGeneratedColumn()
    @ApiProperty({description: "ID"})
    id: number

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

    @CreateDateColumn()
    @ApiProperty({description: "Дата создания"})
    createdAt: Date

    @UpdateDateColumn()
    @ApiProperty({description: "Дата обновления"})
    updatedAt: Date

    @OneToMany(() => SurveyResult, (result) => result.survey)
    results: SurveyResult[]

    @Column()
    @ApiProperty({description: "ID пользователя создавшего опрос"})
    createdBy: number

    @Column({default: true})
    @ApiProperty({description: "Доступен ли опрос для пользователей"})
    enabled: boolean
}