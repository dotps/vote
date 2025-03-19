import {IAnswerDto, IQuestionDto, ISurveyDto} from "./survey.dto"
import {IsArray, IsBoolean, IsInt, IsNotEmpty, IsOptional, IsString, ValidateNested} from "class-validator"
import {Type} from "class-transformer"
import {ApiProperty} from "@nestjs/swagger"

export class UpdateSurveyDto implements ISurveyDto {
    @IsNotEmpty()
    @IsString()
    @ApiProperty({description: "Заголовок опроса"})
    title: string

    @IsNotEmpty()
    @IsString()
    @ApiProperty({description: "Текст опроса"})
    description: string

    @IsArray()
    @ValidateNested({each: true})
    @Type(() => UpdateQuestionDto)
    @ApiProperty({
        description: "Массив объектов с вопросами",
        isArray: true,
        type: () => UpdateQuestionDto,
    })
    questions: UpdateQuestionDto[]
}

export class UpdateQuestionDto implements IQuestionDto {
    @IsOptional()
    @IsInt()
    @ApiProperty({description: "ID вопроса"})
    id: number

    @IsNotEmpty()
    @IsString()
    @ApiProperty({description: "Заголовок вопроса"})
    title: string

    @IsArray()
    @ValidateNested({each: true})
    @Type(() => UpdateAnswerDto)
    @ApiProperty({
        description: "Массив объектов с ответами",
        isArray: true,
        type: () => UpdateAnswerDto,
    })
    answers: UpdateAnswerDto[]
}

export class UpdateAnswerDto implements IAnswerDto {
    @IsOptional()
    @IsInt()
    @ApiProperty({description: "ID ответа"})
    id: number

    @IsNotEmpty()
    @IsString()
    @ApiProperty({description: "Заголовок ответа"})
    title: string
}

export class UpdateSurveyStatusDto {
    @IsBoolean()
    @ApiProperty({description: "Статус"})
    status: boolean
}