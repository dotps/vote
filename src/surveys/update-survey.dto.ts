import {IAnswerDto, IQuestionDto, ISurveyDto} from "./survey.dto"
import {IsArray, IsBoolean, IsInt, IsNotEmpty, IsOptional, IsString, ValidateNested} from "class-validator"
import {Type} from "class-transformer"

export class UpdateSurveyDto implements ISurveyDto {
    @IsNotEmpty()
    @IsString()
    title: string

    @IsNotEmpty()
    @IsString()
    description: string

    @IsArray()
    @ValidateNested({each: true})
    @Type(() => UpdateQuestionDto)
    questions: UpdateQuestionDto[]
}

export class UpdateQuestionDto implements IQuestionDto {
    @IsOptional()
    @IsInt()
    id: number

    @IsNotEmpty()
    @IsString()
    title: string

    @IsArray()
    @ValidateNested({each: true})
    @Type(() => UpdateAnswerDto)
    answers: UpdateAnswerDto[]
}

export class UpdateAnswerDto implements IAnswerDto {
    @IsOptional()
    @IsInt()
    id: number

    @IsNotEmpty()
    @IsString()
    title: string
}

export class UpdateSurveyStatusDto {
    @IsBoolean()
    status: boolean
}