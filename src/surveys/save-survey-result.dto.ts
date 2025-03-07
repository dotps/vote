import {IsArray, IsInt, IsNotEmpty, ValidateNested} from "class-validator"
import {Type} from "class-transformer"
import {IAnswerDto, IQuestionDto, ISurveyDto} from "./survey.dto"

export class SaveSurveyResultDto implements ISurveyDto {
    @IsArray()
    @ValidateNested({each: true})
    @Type(() => SaveQuestionResultDto)
    questions: SaveQuestionResultDto[]
}

export class SaveQuestionResultDto implements IQuestionDto {
    @IsNotEmpty()
    @IsInt()
    id: number

    @IsArray()
    @ValidateNested({each: true})
    @Type(() => SaveAnswerResultDto)
    answers: SaveAnswerResultDto[]
}

export class SaveAnswerResultDto implements IAnswerDto {
    @IsNotEmpty()
    @IsInt()
    id: number
}
