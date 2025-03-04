import {IsString} from "class-validator"

// TODO: добавить обработку
export class SurveyDto {
    @IsString()
    readonly title: string
    @IsString()
    readonly description: string
    // readonly questions: QuestionDto[]
}

export class QuestionDto {
    @IsString()
    readonly title: string
    readonly answers: AnswerDto[]
}

export class AnswerDto {
    @IsString()
    readonly title: string
}