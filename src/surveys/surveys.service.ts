import {BadRequestException, ForbiddenException, Injectable, NotFoundException} from "@nestjs/common"
import {InjectRepository} from "@nestjs/typeorm"
import {Repository} from "typeorm"
import {Survey} from "./survey.entity"
import {
    CreateQuestionDto,
    CreateSurveyDto,
    UpdateAnswerDto,
    UpdateQuestionDto,
    UpdateSurveyDto
} from "./create-survey.dto"
import {SaveSurveyResultDto} from "./save-survey-result.dto"
import {SurveyResult} from "./survey-result.entity"
import {DBError} from "../DBError"
import {ISurveyDto} from "./survey.dto"
import {Question} from "./question.entity"
import {Answer} from "./answer.entity"
import {AnswersService} from "./answers.service"
import {QuestionsService} from "./questions.service"

@Injectable()
export class SurveysService {

    constructor(
        @InjectRepository(Survey)
        private readonly surveyRepository: Repository<Survey>,
        @InjectRepository(Question)
        private readonly questionRepository: Repository<Question>,
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
        const surveys = await this.surveyRepository.find()
        if (surveys.length === 0) throw new NotFoundException()
        return surveys
    }

    async getSurvey(id: number): Promise<Survey> {
        const survey = await this.surveyRepository.findOne({
            where: {id: id},
            relations: ["questions", "questions.answers"],
        })
        if (!survey) throw new NotFoundException("Опрос не найден.")
        return survey
    }

    async saveUserSurveyResult(userId: number, surveyId: number, data: SaveSurveyResultDto): Promise<SurveyResult[]> {
        if (data.questions.length === 0) throw new BadRequestException() // TODO: можно ли через ValidationPipe проверить количество?

        const saveResults: SurveyResult[] = []
        for (const question of data.questions) {
            if (question.answers.length === 0) throw new BadRequestException()

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

        if (!results || results.length === 0) throw new NotFoundException()
        return results as SurveyResultResponse[]
    }

    private addCreatedByUser(data: ISurveyDto, userId: number) {
        data["createdBy"] = userId
    }

    // обновляет только изменившиеся записи и добавляет новые в одну транзакцию
    async updateSurveyCascade(surveyDto: UpdateSurveyDto, userId: number, surveyId: number): Promise<void> {

        const survey = await this.getSurvey(surveyId)
        if (!survey) throw new NotFoundException()
        if (survey.createdBy !== userId) throw new ForbiddenException()

        // TODO: разбить на мелкие методы

        const { questions: questionsDto, ...surveyFields } = surveyDto
        this.updateSurveyFields(survey, surveyFields)

        for (const questionDto of questionsDto) {
            let question: Question

            if (questionDto.id) {
                question = survey.questions.find(q => q.id === questionDto.id)
                if (!question) throw new NotFoundException(`Вопрос id=${questionDto.id} не найден.`)
                question.title = questionDto.title

                for (const answerDto of questionDto.answers) {
                    let answer: Answer

                    if (answerDto.id) {
                        answer = question.answers.find(a => a.id === answerDto.id)
                        if (!answer) throw new NotFoundException(`Ответ id=${answerDto.id} не найден.`)
                        answer.title = answerDto.title
                        // TODO: тут протестировать, answer никуда не передается
                    } else {
                        // TODO: продолжить, вынести в метод и ниже заменить
                        answer = new Answer()
                        const {id: answerId, ...answerFields} = answerDto
                        Object.assign(answer, answerFields)
                        question.answers.push(answer)

                        // answer = new Answer()
                        // answer.title = answerDto.title
                        // question.answers.push(answer)
                    }
                }
            } else {
                question = new Question()
                question.title = questionDto.title
                question.answers = []

                for (const answerDto of questionDto.answers) {

                    const answer = new Answer()
                    answer.title = answerDto.title
                    question.answers.push(answer)
                }

                survey.questions.push(question)
            }
        }

        await this.surveyRepository.save(survey)
    }

    private updateSurveyFields(survey: Survey, surveyFields: Partial<UpdateSurveyDto>) {
        Object.assign(survey, surveyFields)
    }

    async updateSurvey(surveyDto: UpdateSurveyDto, userId: number, surveyId: number): Promise<void> {

        const survey = await this.getSurvey(surveyId)
        if (!survey) throw new NotFoundException()
        if (survey.createdBy !== userId) throw new ForbiddenException()

        const surveyFields: Partial<UpdateSurveyDto> = {
            title: surveyDto.title,
            description: surveyDto.description,
        }

        await this.surveyRepository.update(surveyId, surveyFields)

        for (const questionDto of surveyDto.questions) {
            let question: Question
            const questionWithoutAnswersDto = {
                ...questionDto,
                answers: undefined // убрать вопросы чтобы каскадно не добавились
            }

            if (questionDto.id) {
                question = survey.questions.find(q => q.id === questionDto.id)
                if (!question) throw new NotFoundException(`Вопрос id=${questionDto.id} не найден.`)
                await this.questionsService.updateQuestion(userId, surveyId, questionWithoutAnswersDto)

            } else {
                question = await this.questionsService.createQuestion(userId, surveyId, questionWithoutAnswersDto)
            }

            for (const answerDto of questionDto.answers) {
                let answer: Answer

                // TODO: при таком способе будут разные транзакции, отката не будет в случае ошибки
                // есть возможноть использовать {transaction: false} для save + применить EntityManager
                if (answerDto.id) {
                    const isReturnUpdatedData = false
                    const a = await this.answersService.updateAnswer(userId, surveyId, answerDto, isReturnUpdatedData)
                } else {
                    if (question.id) {
                        await this.answersService.createAnswer(userId, surveyId, question.id, answerDto)
                    }
                }
            }
        }
    }

}

export type SurveyResultResponse = {
    surveyId: number,
    surveyTitle: string,
    questionId: number,
    questionTitle: string,
    answerId: number,
    answerTitle: string,
    answerCount: number
}
