import {IsArray, IsInt, IsNotEmpty, IsOptional, IsString, ValidateNested} from "class-validator"
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


///////////////////////


export class UpdateSurveyDto implements ISurveyDto {
    @IsNotEmpty()
    @IsString()
    title: string

    @IsNotEmpty()
    @IsString()
    description: string

    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => UpdateQuestionDto)
    questions: UpdateQuestionDto[]

    // @IsNotEmpty()
    // @IsInt()
    // createdBy: number
}

export class UpdateQuestionDto implements IQuestionDto {
    @IsOptional()
    @IsInt()
    id: number

    @IsNotEmpty()
    @IsString()
    title: string

    @IsArray()
    @ValidateNested({ each: true })
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