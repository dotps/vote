import {IsArray, IsInt, IsNotEmpty, ValidateNested} from "class-validator"
import {Type} from "class-transformer"
import {IAnswerDto, IQuestionDto, ISurveyDto} from "./survey.dto"
import { ApiProperty } from "@nestjs/swagger"
import { CreateQuestionDto } from "./create-survey.dto"

export class SaveSurveyResultDto implements ISurveyDto {
    @IsArray()
    @ValidateNested({each: true})
    @Type(() => SaveQuestionResultDto)
    @ApiProperty({
        description: "Массив объектов с вопросами",
        isArray: true,
        type: () => SaveQuestionResultDto,
    })
    questions: SaveQuestionResultDto[]
}

export class SaveQuestionResultDto implements IQuestionDto {
    @IsNotEmpty()
    @IsInt()
    @ApiProperty({ description: "ID вопроса" })
    id: number

    @IsArray()
    @ValidateNested({each: true})
    @Type(() => SaveAnswerResultDto)
    @ApiProperty({
        description: "Массив объектов с ответами",
        isArray: true,
        type: () => SaveAnswerResultDto,
    })
    answers: SaveAnswerResultDto[]
}

export class SaveAnswerResultDto implements IAnswerDto {
    @IsNotEmpty()
    @IsInt()
    @ApiProperty({ description: "ID ответа" })
    id: number
}
