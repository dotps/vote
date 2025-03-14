export interface ISurveyDto {
    title?: string
    description?: string
    enabled?: boolean
    questions: IQuestionDto[]
    // createdBy: number
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