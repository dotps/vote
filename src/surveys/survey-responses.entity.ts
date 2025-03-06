import {Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn} from "typeorm"

@Entity()
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