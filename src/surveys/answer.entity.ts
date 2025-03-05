import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from "typeorm"
import { Question } from "./question.entity"

@Entity()
export class Answer {
  @PrimaryGeneratedColumn()
  id: number

  @Column()
  title: string

  @ManyToOne(() => Question, (question) => question.answers)
  question: Question
}
