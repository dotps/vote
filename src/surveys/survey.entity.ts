import {Entity, PrimaryGeneratedColumn, Column, OneToMany, CreateDateColumn, UpdateDateColumn} from "typeorm"
import {Question} from "./question.entity"
import {SurveyResult} from "./survey-result.entity"

@Entity()
export class Survey {
    @PrimaryGeneratedColumn()
    id: number

    @Column()
    title: string

    @Column()
    description: string

    @OneToMany(() => Question, (question) => question.survey, {
        cascade: true,
        onDelete: "CASCADE"
    })
    questions: Question[]

    @CreateDateColumn()
    createdAt: Date

    @UpdateDateColumn()
    updatedAt: Date

    @OneToMany(() => SurveyResult, (result) => result.survey)
    results: SurveyResult[]

    @Column()
    createdBy: number

    @Column({default: true})
    enabled: boolean
}