import {IsArray, IsInt, IsNotEmpty, ValidateNested} from "class-validator"
import {Type} from "class-transformer"
import {IAnswerDto, IQuestionDto, ISurveyDto} from "./survey.dto"

export class SaveSurveyResponseDto implements ISurveyDto {
    @IsArray()
    @ValidateNested({each: true})
    @Type(() => SaveQuestionResponseDto)
    questions: SaveQuestionResponseDto[]
}

export class SaveQuestionResponseDto implements IQuestionDto {
    @IsNotEmpty()
    @IsInt()
    id: number

    @IsArray()
    @ValidateNested({each: true})
    @Type(() => SaveAnswerResponseDto)
    answers: SaveAnswerResponseDto[]
}

export class SaveAnswerResponseDto implements IAnswerDto {
    @IsNotEmpty()
    @IsInt()
    id: number
}
