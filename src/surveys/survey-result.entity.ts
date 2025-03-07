import {Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Unique, ManyToOne} from "typeorm"
import {Survey} from "./survey.entity"
import {User} from "../users/user.entity"
import {Question} from "./question.entity"
import {Answer} from "./answer.entity"

@Entity()
@Unique(["userId", "surveyId", "questionId"]) // запрет на уровне БД для повторных ответов
export class SurveyResult {
  @PrimaryGeneratedColumn()
  id: number

  @Column()
  surveyId: number

  @ManyToOne(() => Survey, (survey) => survey.results)
  survey: Survey

  @Column()
  userId: number

  @ManyToOne(() => User, (user) => user.surveyResults)
  user: User

  @Column()
  questionId: number

  @ManyToOne(() => Question, (question) => question.results)
  question: Question

  @Column()
  answerId: number

  @ManyToOne(() => Answer, (answer) => answer.results)
  answer: Answer

  @CreateDateColumn()
  createdAt: Date

  @UpdateDateColumn()
  updatedAt: Date
}