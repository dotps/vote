import { IsArray, IsInt, IsNotEmpty, IsString, ValidateNested } from "class-validator"
import {Type} from "class-transformer"
import {IAnswerDto, IQuestionDto, ISurveyDto} from "./survey.dto"

export class CreateSurveyDto implements ISurveyDto {
    @IsNotEmpty()
    @IsString()
    title: string

    @IsNotEmpty()
    @IsString()
    description: string

    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => CreateQuestionDto)
    questions: CreateQuestionDto[]

    // @IsNotEmpty()
    // @IsInt()
    // createdBy: number
}

export class CreateQuestionDto implements IQuestionDto {
    @IsNotEmpty()
    @IsString()
    title: string

    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => CreateAnswerDto)
    answers: CreateAnswerDto[]
}

export class CreateAnswerDto implements IAnswerDto {
    @IsNotEmpty()
    @IsString()
    title: string
}