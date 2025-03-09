import {BadRequestException, Injectable, NotFoundException} from "@nestjs/common"
import {InjectRepository} from "@nestjs/typeorm"
import {Repository} from "typeorm"
import {Survey} from "./survey.entity"
import {CreateSurveyDto} from "./create-survey.dto"
import {SaveSurveyResultDto} from "./save-survey-result.dto"
import {SurveyResult} from "./survey-result.entity"
import {DBError} from "../DBError"
import { ISurveyDto } from "./survey.dto"

@Injectable()
export class SurveysService {

    constructor(
        @InjectRepository(Survey)
        private readonly surveyRepository: Repository<Survey>,
        @InjectRepository(SurveyResult)
        private readonly resultRepository: Repository<SurveyResult>,
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
          .where("result.surveyId = :surveyId", { surveyId: id })
          .groupBy("survey.id, survey.title, question.id, question.Title, answer.id, answer.Title")
          .orderBy("question.id, answer.id")
          .getRawMany()

        if (!results || results.length === 0) throw new NotFoundException()
        return results as SurveyResultResponse[]
    }

    private addCreatedByUser(data: ISurveyDto, userId: number) {
        data["createdBy"] = userId
    }

    async updateSurvey(data: CreateSurveyDto, userId: number, surveyId: number) {
        const survey = await this.getSurvey(surveyId)

        console.log(survey)
        if (!survey || survey.createdBy !== userId) throw new NotFoundException()
        Object.assign(survey, data)
        console.log(survey)
        return await this.surveyRepository.save(survey)
        // TODO: через debug разораться с обновлением
        // когда прилетает не корректный объект странно себя ведет
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
