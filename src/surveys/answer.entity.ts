import {Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany} from "typeorm"
import { Question } from "./question.entity"
import {SurveyResult} from "./survey-result.entity"

@Entity()
export class Answer {
  @PrimaryGeneratedColumn()
  id: number

  @Column()
  title: string

  @ManyToOne(() => Question, (question) => question.answers)
  question: Question

  @OneToMany(() => SurveyResult, (result) => result.answer)
  results: SurveyResult[]
}
