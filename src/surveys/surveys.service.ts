import {BadRequestException, ForbiddenException, Injectable, NotFoundException} from "@nestjs/common"
import {InjectRepository} from "@nestjs/typeorm"
import {Repository} from "typeorm"
import {Survey} from "./survey.entity"
import {
    CreateSurveyDto,
    UpdateAnswerDto,
    UpdateQuestionDto,
    UpdateSurveyDto
} from "./create-survey.dto"
import {SaveSurveyResultDto} from "./save-survey-result.dto"
import {SurveyResult} from "./survey-result.entity"
import {DBError} from "../errors/DBError"
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

    async updateSurvey(surveyDto: UpdateSurveyDto, userId: number, surveyId: number): Promise<void> {

        const survey = await this.getSurvey(surveyId)
        if (survey.createdBy !== userId) throw new ForbiddenException()

        const {questions: questionsDto, ...surveyFields} = surveyDto
        this.updateSurveyFields(survey, surveyFields)
        this.updateQuestionsInSurvey(survey.questions, questionsDto)

        await this.surveyRepository.save(survey)
    }

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
        if (!answer) throw new NotFoundException(`Ответ id=${answerDto.id} не найден.`)
        this.answersService.updateAnswerObjectFromDto(answer, answerDto)
        return answer
    }

    private updateQuestion(questions: Question[], questionDto: UpdateQuestionDto): Question {
        const question = questions.find(q => q.id === questionDto.id)
        if (!question) throw new NotFoundException(`Вопрос id=${questionDto.id} не найден.`)
        this.questionsService.updateQuestionObjectFromDto(question, questionDto)
        return question
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
