import {Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, JoinColumn} from "typeorm"
import { Question } from "./question.entity"
import {SurveyResult} from "./survey-result.entity"

@Entity()
export class Answer {
  @PrimaryGeneratedColumn()
  id: number

  @Column()
  title: string

  @ManyToOne(() => Question, (question) => question.answers)
  @JoinColumn({ name: "questionId" })
  question: Question

  @Column({ nullable: false })
  questionId: number

  @OneToMany(() => SurveyResult, (result) => result.answer)
  results: SurveyResult[]
}
