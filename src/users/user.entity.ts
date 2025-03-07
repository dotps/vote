import {Entity, Column, PrimaryGeneratedColumn, OneToMany} from "typeorm"
import {SurveyResult} from "../surveys/survey-result.entity"

@Entity()
export class User {
    @PrimaryGeneratedColumn()
    readonly id: number

    @Column()
    readonly name: string

    @Column()
    readonly email: string

    @Column()
    readonly password: string

    @OneToMany(() => SurveyResult, (result) => result.user)
    surveyResults: SurveyResult[]
}