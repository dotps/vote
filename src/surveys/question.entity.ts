import {Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, CreateDateColumn, UpdateDateColumn} from "typeorm"
import { Survey } from "./survey.entity"
import { Answer } from "./answer.entity"
import {SurveyResult} from "./survey-result.entity"

@Entity()
export class Question {
  @PrimaryGeneratedColumn()
  id: number

  @Column()
  title: string

  @ManyToOne(() => Survey, (survey) => survey.questions)
  survey: Survey

  @Column({ nullable: false })
  surveyId: number

  @OneToMany(() => Answer, (answer) => answer.question, {
    cascade: true,
    onDelete: "CASCADE"
  })
  answers: Answer[]

  @OneToMany(() => SurveyResult, (result) => result.question)
  results: SurveyResult[]

  @CreateDateColumn()
  createdAt: Date

  @UpdateDateColumn()
  updatedAt: Date
}
