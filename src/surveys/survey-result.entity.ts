import {Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Unique, ManyToOne} from "typeorm"
import {Survey} from "./survey.entity"
import {User} from "../users/user.entity"
import {Question} from "./question.entity"
import {Answer} from "./answer.entity"
import { ApiProperty } from "@nestjs/swagger"

@Entity()
@Unique(["userId", "surveyId", "questionId"]) // запрет на уровне БД для повторных ответов
export class SurveyResult {
  @PrimaryGeneratedColumn()
  @ApiProperty({ description: "ID" })
  id: number

  @Column()
  @ApiProperty({ description: "ID опроса" })
  surveyId: number

  @ManyToOne(() => Survey, (survey) => survey.results)
  survey: Survey

  @Column()
  @ApiProperty({ description: "ID проголосовавшего пользователя" })
  userId: number

  @ManyToOne(() => User, (user) => user.surveyResults)
  user: User

  @Column()
  @ApiProperty({ description: "ID вопроса" })
  questionId: number

  @ManyToOne(() => Question, (question) => question.results)
  question: Question

  @Column()
  @ApiProperty({ description: "ID ответа" })
  answerId: number

  @ManyToOne(() => Answer, (answer) => answer.results)
  answer: Answer

  @CreateDateColumn()
  @ApiProperty({ description: "Дата создания" })
  createdAt: Date

  @UpdateDateColumn()
  @ApiProperty({ description: "Дата обновления" })
  updatedAt: Date
}