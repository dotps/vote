export interface ISurveyDto {
    title?: string
    description?: string
    questions: IQuestionDto[]
}

export interface IQuestionDto {
    id?: number
    title?: string
    answers: IAnswerDto[]
}

export interface IAnswerDto {
    id?: number
    title?: string
}