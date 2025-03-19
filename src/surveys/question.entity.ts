import {Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, CreateDateColumn, UpdateDateColumn} from "typeorm"
import {Survey} from "./survey.entity"
import {Answer} from "./answer.entity"
import {SurveyResult} from "./survey-result.entity"
import {ApiProperty} from "@nestjs/swagger"

@Entity()
export class Question {
    @PrimaryGeneratedColumn()
    @ApiProperty({description: "ID"})
    id: number

    @Column()
    @ApiProperty({description: "Заголовок"})
    title: string

    @ManyToOne(() => Survey, (survey) => survey.questions)
    survey: Survey

    @Column({nullable: false})
    surveyId: number

    @OneToMany(() => Answer, (answer) => answer.question, {
        cascade: true,
        onDelete: "CASCADE"
    })
    @ApiProperty({
        description: "Массив объектов с ответами",
        isArray: true,
        type: () => Answer,
    })
    answers: Answer[]

    @OneToMany(() => SurveyResult, (result) => result.question)
    results: SurveyResult[]

    @CreateDateColumn()
    @ApiProperty({description: "Дата создания"})
    createdAt: Date

    @UpdateDateColumn()
    @ApiProperty({description: "Дата обновления"})
    updatedAt: Date
}
