import {ArrayMinSize, IsArray, IsNotEmpty, IsString, ValidateNested} from "class-validator"
import {Type} from "class-transformer"
import {IAnswerDto, IQuestionDto, ISurveyDto} from "./survey.dto"
import {ApiProperty} from "@nestjs/swagger"

export class CreateSurveyDto implements ISurveyDto {
    @IsNotEmpty()
    @IsString()
    @ApiProperty({description: "Заголовок"})
    title: string

    @IsNotEmpty()
    @IsString()
    @ApiProperty({description: "Текст опроса"})
    description: string

    @IsArray()
    @ArrayMinSize(1)
    @ValidateNested({each: true})
    @Type(() => CreateQuestionDto)
    @ApiProperty({
        description: "Массив объектов с вопросами",
        isArray: true,
        type: () => CreateQuestionDto,
    })
    questions: CreateQuestionDto[]
}

export class CreateQuestionDto implements IQuestionDto {
    @IsNotEmpty()
    @IsString()
    @ApiProperty({description: "Заголовок"})
    title: string

    @IsArray()
    @ArrayMinSize(1)
    @ValidateNested({each: true})
    @Type(() => CreateAnswerDto)
    @ApiProperty({
        description: "Массив объектов с ответами",
        isArray: true,
        type: () => CreateAnswerDto,
    })
    answers: CreateAnswerDto[]
}

export class CreateAnswerDto implements IAnswerDto {
    @IsNotEmpty()
    @IsString()
    @ApiProperty({description: "Заголовок"})
    title: string
}