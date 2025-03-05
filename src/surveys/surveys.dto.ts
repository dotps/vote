import { IsArray, IsNotEmpty, IsString, ValidateNested } from "class-validator"
import { Type } from "class-transformer"

export class SurveyDto {
    @IsString()
    readonly title: string
    @IsString()
    readonly description: string
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => QuestionDto)
    readonly questions: QuestionDto[]
}

export class QuestionDto {
    @IsString()
    readonly title: string
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => AnswerDto)
    readonly answers: AnswerDto[]
}

export class AnswerDto {
    @IsString()
    readonly title: string
}