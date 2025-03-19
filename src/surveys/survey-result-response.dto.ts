import {ApiProperty} from "@nestjs/swagger"

export class SurveyResultResponseDto {
    @ApiProperty({description: "ID опроса"})
    surveyId: number
    @ApiProperty({description: "Заголовок опроса"})
    surveyTitle: string
    @ApiProperty({description: "ID вопроса"})
    questionId: number
    @ApiProperty({description: "Заголовок вопроса"})
    questionTitle: string
    @ApiProperty({description: "ID ответа"})
    answerId: number
    @ApiProperty({description: "Заголовок ответа"})
    answerTitle: string
    @ApiProperty({description: "Сколько раз был выбран данный ответ"})
    answerCount: number
}