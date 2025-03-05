import { IsArray, IsInt, IsNotEmpty, IsOptional, IsString, ValidateNested } from "class-validator"
import { Type } from "class-transformer"
import { RemoveFromGroups } from "../users/remove-from-groups.transformer"
import { ValidationGroup } from "../ValidationGroup"

export class SurveyDto {

    // @RemoveFromGroups([ValidationGroup.SURVEY_SAVE_RESPONSE])
    // @IsNotEmpty({ groups: [ValidationGroup.CREATE] })
    @IsString()
    readonly title: string

    // @RemoveFromGroups([ValidationGroup.SURVEY_SAVE_RESPONSE])
    // @IsNotEmpty({ groups: [ValidationGroup.CREATE] })
    @IsString()
    readonly description: string

    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => QuestionDto)
    readonly questions: QuestionDto[]
}

export class QuestionDto {

    @RemoveFromGroups([ValidationGroup.CREATE])
    // @IsNotEmpty({ groups: [ValidationGroup.SURVEY_SAVE_RESPONSE] })
    // @IsInt({ groups: [ValidationGroup.SURVEY_SAVE_RESPONSE] })
    readonly id: number

    @RemoveFromGroups([ValidationGroup.SURVEY_SAVE_RESPONSE])
    @IsString()
    readonly title: string

    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => AnswerDto)
    readonly answers: AnswerDto[]
}

// TODO: запутался с группами, найти другой способ

export class AnswerDto {

    // @RemoveFromGroups([ValidationGroup.CREATE])
    // @IsNotEmpty({ groups: [ValidationGroup.SURVEY_SAVE_RESPONSE] })
    // @IsInt({ groups: [ValidationGroup.SURVEY_SAVE_RESPONSE] })
    // readonly id?: number

    // @RemoveFromGroups([ValidationGroup.SURVEY_SAVE_RESPONSE])
    // @IsNotEmpty({ groups: [ValidationGroup.CREATE] })
    @IsString()
    readonly title: string
}