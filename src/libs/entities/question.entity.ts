import {Entity, Column, ManyToOne, OneToMany} from "typeorm"
import {Survey} from "./survey.entity"
import {Answer} from "./answer.entity"
import {SurveyResult} from "./survey-result.entity"
import {ApiProperty} from "@nestjs/swagger"
import {BaseEntity} from "./base.entity"

@Entity()
export class Question extends BaseEntity {
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
}
