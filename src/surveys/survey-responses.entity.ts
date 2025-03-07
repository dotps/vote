import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Unique } from "typeorm"

@Entity()
@Unique(["userId", "surveyId", "questionId"]) // запрет на уровне БД для повторных ответов
export class SurveyResponses {
  @PrimaryGeneratedColumn()
  id: number

  @Column()
  surveyId: number

  @Column()
  userId: number

  @Column()
  questionId: number

  @Column()
  answerId: number

  @CreateDateColumn()
  createdAt: Date

  @UpdateDateColumn()
  updatedAt: Date
}