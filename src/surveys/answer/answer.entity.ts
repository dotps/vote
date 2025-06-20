import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    OneToMany,
    JoinColumn,
    CreateDateColumn,
    UpdateDateColumn
} from "typeorm"
import {Question} from "../question/question.entity"
import {SurveyResult} from "../survey/survey-result.entity"
import {ApiProperty} from "@nestjs/swagger"

@Entity()
export class Answer {
    @PrimaryGeneratedColumn()
    @ApiProperty({description: "ID"})
    id: number

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

    @CreateDateColumn()
    @ApiProperty({description: "Дата создания"})
    createdAt: Date

    @UpdateDateColumn()
    @ApiProperty({description: "Дата обновления"})
    updatedAt: Date
}
