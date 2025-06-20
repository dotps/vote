import {
    Entity,
    Column,
    ManyToOne,
    OneToMany,
    JoinColumn,
} from "typeorm"
import {Question} from "../question/question.entity"
import {SurveyResult} from "../survey/survey-result.entity"
import {ApiProperty} from "@nestjs/swagger"
import {BaseEntity} from "../base.entity"

@Entity()
export class Answer extends BaseEntity {
    @Column()
    @ApiProperty({description: "Заголовок"})
    title: string

    @ManyToOne(() => Question, (question) => question.answers)
    @JoinColumn({name: "questionId"})
    question: Question

    @Column({nullable: false})
    questionId: number

    @OneToMany(() => SurveyResult, (result) => result.answer)
    results: SurveyResult[]
}
