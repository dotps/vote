import {BadRequestException, ForbiddenException, Injectable, NotFoundException} from "@nestjs/common"
import {InjectRepository} from "@nestjs/typeorm"
import {Repository} from "typeorm"
import {Survey} from "./survey.entity"
import {CreateSurveyDto} from "./dto/create-survey.dto"
import {SaveQuestionResultDto, SaveSurveyResultDto} from "./dto/save-survey-result.dto"
import {SurveyResult} from "./survey-result.entity"
import {DbError} from "../../errors/db-error"
import {ISurveyDto} from "./dto/survey.dto"
import {Errors, ErrorsMessages} from "../../errors/errors"
import {UpdateSurveyDto} from "./dto/update-survey.dto"
import {User} from "../../users/user.entity"
import {SurveyResultResponseDto} from "./dto/survey-result-response.dto"
import {UpdateSurveysService} from "./update-surveys.service"
import {Responses, ResponseUpdateDto} from "../../responses/responses"

@Injectable()
export class SurveysService {

    constructor(
        @InjectRepository(Survey)
        private readonly surveyRepository: Repository<Survey>,
        @InjectRepository(SurveyResult)
        private readonly resultRepository: Repository<SurveyResult>,
        private updateSurveysService: UpdateSurveysService,
    ) {
    }

    async createSurvey(data: CreateSurveyDto, user: User): Promise<Survey> {
        this.addCreatedByUser(data, user.id)
        const survey = this.surveyRepository.create(data)
        return await this.surveyRepository.save(survey)
    }

    async getAllSurveys(): Promise<Survey[]> {
        const surveys = await this.surveyRepository.find({
            where: {enabled: true}
        })

        if (surveys.length === 0) throw new NotFoundException(ErrorsMessages.SurveyNotFound)

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

        if (!survey) throw new NotFoundException(Errors.displayId(id) + ErrorsMessages.SurveyNotFound)

        return survey
    }

    async saveUserSurveyResult(user: User, surveyId: number, data: SaveSurveyResultDto): Promise<SurveyResult[]> {
        const survey = await this.getSurvey(surveyId, {isExcludeRelations: true, enabled: true})
        if (!survey) throw new NotFoundException(Errors.displayId(surveyId) + ErrorsMessages.SurveyNotFound)

        if (data.questions.length === 0) throw new BadRequestException(ErrorsMessages.QuestionsNotEmpty)

        return await this.saveSurveyResult(user.id, surveyId, data.questions)
    }

    private async saveSurveyResult(userId: number, surveyId: number, questions: SaveQuestionResultDto[]): Promise<SurveyResult[]> {
        const savedResults: SurveyResult[] = []
        for (const question of questions) {
            if (question.answers.length === 0) throw new BadRequestException(ErrorsMessages.AnswersNotEmpty)

            for (const answer of question.answers) {
                try {
                    const surveyResult = this.resultRepository.create({
                        surveyId: surveyId,
                        userId: userId,
                        questionId: question.id,
                        answerId: answer.id,
                    })
                    const result = await this.resultRepository.save(surveyResult)
                    savedResults.push(result)
                } catch (error) {
                    DbError.handle(error)
                }
            }
        }
        return savedResults
    }

    async getSurveyResult(id: number): Promise<SurveyResultResponseDto[]> {
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

        if (!results || results.length === 0) throw new NotFoundException(ErrorsMessages.SurveyResultsNotFound)
        return results as SurveyResultResponseDto[]
    }

    private addCreatedByUser(data: ISurveyDto, userId: number) {
        data["createdBy"] = userId
    }

    async updateSurvey(surveyDto: UpdateSurveyDto, user: User, surveyId: number): Promise<Survey> {
        const survey = await this.getSurvey(surveyId)
        if (!user.isSelf(survey?.createdBy)) throw new ForbiddenException(ErrorsMessages.SurveyUpdateForbidden)

        this.updateSurveysService.updateSurvey(survey, surveyDto)

        return await this.surveyRepository.save(survey)
    }

    async setSurveyActive(user: User, surveyId: number, enabled: boolean): Promise<ResponseUpdateDto> {
        const survey = await this.getSurvey(surveyId, {isExcludeRelations: true})
        if (!user.isSelf(survey?.createdBy)) throw new ForbiddenException(ErrorsMessages.SurveyUpdateForbidden)

        const surveyForUpdate = this.surveyRepository.create({
            enabled: enabled,
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