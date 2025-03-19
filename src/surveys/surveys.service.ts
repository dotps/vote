import {BadRequestException, ForbiddenException, Injectable, NotFoundException} from "@nestjs/common"
import {InjectRepository} from "@nestjs/typeorm"
import {Repository} from "typeorm"
import {Survey} from "./survey.entity"
import {
    CreateSurveyDto
} from "./create-survey.dto"
import {SaveSurveyResultDto} from "./save-survey-result.dto"
import {SurveyResult} from "./survey-result.entity"
import {DBError} from "../errors/DBError"
import {ISurveyDto} from "./survey.dto"
import {Question} from "./question.entity"
import {Answer} from "./answer.entity"
import {AnswersService} from "./answers.service"
import {QuestionsService} from "./questions.service"
import {Errors, ErrorsMessages} from "../errors/errors"
import {ResponseUpdateDto, Responses} from "../responses/Responses"
import {UpdateAnswerDto, UpdateQuestionDto, UpdateSurveyDto} from "./update-survey.dto"
import { ApiProperty } from "@nestjs/swagger"

@Injectable()
export class SurveysService {

    constructor(
        @InjectRepository(Survey)
        private readonly surveyRepository: Repository<Survey>,
        @InjectRepository(SurveyResult)
        private readonly resultRepository: Repository<SurveyResult>,
        private answersService: AnswersService,
        private questionsService: QuestionsService,
    ) {
    }

    async createSurvey(data: CreateSurveyDto, userId: number): Promise<Survey> {
        this.addCreatedByUser(data, userId)
        const survey = this.surveyRepository.create(data)
        return await this.surveyRepository.save(survey)
    }

    async getAllSurveys(): Promise<Survey[]> {
        const surveys = await this.surveyRepository.find({
            where: { enabled: true }
        })
        if (surveys.length === 0) throw new NotFoundException(ErrorsMessages.SURVEY_NOT_FOUND)
        return surveys
    }

    async getSurvey(id: number, options: GetSurveyOptions = defaultGetSurveyOptions): Promise<Survey> {
        const relations = options.isExcludeRelations ? [] : ["questions", "questions.answers"]
        const survey = await this.surveyRepository.findOne({
            where: {
                id: id,
                enabled: options.enabled,
            },
            relations: relations,
        })
        if (!survey) throw new NotFoundException(Errors.displayId(id) + ErrorsMessages.SURVEY_NOT_FOUND)
        return survey
    }

    async saveUserSurveyResult(userId: number, surveyId: number, data: SaveSurveyResultDto): Promise<SurveyResult[]> {

        const survey = await this.getSurvey(surveyId, {isExcludeRelations: true, enabled: true})
        if (!survey) throw new NotFoundException(Errors.displayId(surveyId) + ErrorsMessages.SURVEY_NOT_FOUND)

        if (data.questions.length === 0) throw new BadRequestException(ErrorsMessages.QUESTIONS_NOT_EMPTY)

        const saveResults: SurveyResult[] = []
        for (const question of data.questions) {
            if (question.answers.length === 0) throw new BadRequestException(ErrorsMessages.ANSWERS_NOT_EMPTY)

            for (const answer of question.answers) {
                try {
                    const surveyResult = this.resultRepository.create({
                        surveyId: surveyId,
                        userId: userId,
                        questionId: question.id,
                        answerId: answer.id,
                    })
                    const result = await this.resultRepository.save(surveyResult)
                    saveResults.push(result)
                } catch (error) {
                    DBError.handle(error)
                }
            }
        }
        return saveResults
    }

    async getSurveyResult(id: number): Promise<SurveyResultResponse[]> {
        const results = await this.resultRepository
            .createQueryBuilder("result")
            .select("survey.title", "surveyTitle")
            .addSelect("survey.id", "surveyId")
            .addSelect("question.id", "questionId")
            .addSelect("question.title", "questionTitle")
            .addSelect("answer.id", "answerId")
            .addSelect("answer.title", "answerTitle")
            .addSelect("COUNT(result.id)", "answerCount")
            .innerJoin("result.survey", "survey")
            .innerJoin("result.question", "question")
            .innerJoin("result.answer", "answer")
            .where("result.surveyId = :surveyId", {surveyId: id})
            .groupBy("survey.id, survey.title, question.id, question.Title, answer.id, answer.Title")
            .orderBy("question.id, answer.id")
            .getRawMany()

        if (!results || results.length === 0) throw new NotFoundException(ErrorsMessages.SURVEY_RESULTS_NOT_FOUND)
        return results as SurveyResultResponse[]
    }

    private addCreatedByUser(data: ISurveyDto, userId: number) {
        data["createdBy"] = userId
    }

    async updateSurvey(surveyDto: UpdateSurveyDto, userId: number, surveyId: number): Promise<Survey> {

        const survey = await this.getSurvey(surveyId)
        if (survey.createdBy !== userId) throw new ForbiddenException(ErrorsMessages.SURVEY_UPDATE_FORBIDDEN)

        const {questions: questionsDto, ...surveyFields} = surveyDto
        this.updateSurveyFields(survey, surveyFields)
        this.updateQuestionsInSurvey(survey.questions, questionsDto)

        return await this.surveyRepository.save(survey)
    }

    // TODO: вынести методы ниже в отдельный сервис UpdateSurveyService
    private updateQuestionsInSurvey(questions: Question[], questionsDto: UpdateQuestionDto[]) {
        for (const questionDto of questionsDto) {
            if (questionDto.id) {
                const question = this.updateQuestion(questions, questionDto)
                for (const answerDto of questionDto.answers) {
                    if (answerDto.id) this.updateAnswer(question.answers, answerDto)
                    else this.createAnswerAndAddToQuestion(answerDto, question)
                }
            } else {
                const question = this.createQuestionFromDtoWithoutAnswers(questionDto)
                for (const answerDto of questionDto.answers) {
                    this.createAnswerAndAddToQuestion(answerDto, question)
                }
                questions.push(question)
            }
        }
    }

    private updateSurveyFields(survey: Survey, surveyFields: Partial<UpdateSurveyDto>) {
        Object.assign(survey, surveyFields)
    }

    private createAnswerAndAddToQuestion(answerDto: UpdateAnswerDto, question: Question) {
        const answer = this.answersService.createAnswerObjectFromDto(answerDto)
        question.answers.push(answer)
    }

    private createQuestionFromDtoWithoutAnswers(questionDto: UpdateQuestionDto): Question {
        const question = new Question()
        this.questionsService.updateQuestionObjectFromDto(question, questionDto)
        question.answers = []
        return question
    }

    private updateAnswer(answers: Answer[], answerDto: UpdateAnswerDto): Answer {
        const answer = answers.find(a => a.id === answerDto.id)
        if (!answer) throw new NotFoundException(Errors.displayId(answerDto.id) + ErrorsMessages.ANSWER_NOT_FOUND)
        this.answersService.updateAnswerObjectFromDto(answer, answerDto)
        return answer
    }

    private updateQuestion(questions: Question[], questionDto: UpdateQuestionDto): Question {
        const question = questions.find(q => q.id === questionDto.id)
        if (!question) throw new NotFoundException(Errors.displayId(questionDto.id) + ErrorsMessages.QUESTION_NOT_FOUND)
        this.questionsService.updateQuestionObjectFromDto(question, questionDto)
        return question
    }

    async setSurveyActive(userId: number, surveyId: number, status: boolean): Promise<ResponseUpdateDto> {
        const survey = await this.getSurvey(surveyId, {isExcludeRelations: true})
        // TODO: вместо userId: number, передать user и заменить на user.isSelf(survey.createdBy), таких мест много
        if (survey.createdBy !== userId) throw new ForbiddenException(ErrorsMessages.SURVEY_UPDATE_FORBIDDEN)

        const surveyForUpdate = this.surveyRepository.create({
            enabled: status,
        })

        const result = await this.surveyRepository.update(surveyId, surveyForUpdate)
        return Responses.update(result)
    }
}

export type GetSurveyOptions = {
    isExcludeRelations: boolean
    enabled?: boolean
}

const defaultGetSurveyOptions: GetSurveyOptions = {
    isExcludeRelations: false,
    enabled: undefined,
}

/*
export type SurveyResultResponse = {
    surveyId: number,
    surveyTitle: string,
    questionId: number,
    questionTitle: string,
    answerId: number,
    answerTitle: string,
    answerCount: number
}*/

export class SurveyResultResponse {
    @ApiProperty({ description: "ID опроса" })
    surveyId: number
    @ApiProperty({ description: "Заголовок опроса" })
    surveyTitle: string
    @ApiProperty({ description: "ID вопроса" })
    questionId: number
    @ApiProperty({ description: "Заголовок вопроса" })
    questionTitle: string
    @ApiProperty({ description: "ID ответа" })
    answerId: number
    @ApiProperty({ description: "Заголовок ответа" })
    answerTitle: string
    @ApiProperty({ description: "Сколько раз был выбран данный ответ" })
    answerCount: number
}
