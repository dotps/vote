import {BadRequestException, Injectable, NotFoundException} from "@nestjs/common"
import {InjectRepository} from "@nestjs/typeorm"
import {Repository} from "typeorm"
import {Survey} from "./survey.entity"
import {CreateSurveyDto} from "./create-survey.dto"
import {SaveSurveyResponseDto} from "./save-survey-response.dto"
import {SurveyResponses} from "./survey-responses.entity"

@Injectable()
export class SurveysService {

    constructor(
      @InjectRepository(Survey)
      private readonly surveyRepository: Repository<Survey>,
      @InjectRepository(SurveyResponses)
      private readonly responseRepository: Repository<SurveyResponses>,
    ) {}

    async createSurvey(data: CreateSurveyDto): Promise<Survey> {
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
            where: { id: id },
            relations: ['questions', 'questions.answers']
        })
        if (!survey) throw new NotFoundException()
        return survey
    }

    async saveUserSurveyResponse(userId: number, surveyId: number, data: SaveSurveyResponseDto): Promise<SurveyResponses[]> {
        if (data.questions.length === 0) throw new BadRequestException() // TODO: можно ли через ValidationPipe проверить количество?

        const saveResults: SurveyResponses[] = []
        for (const question of data.questions) {
            // question.id - есть ли в БД?
            if (question.answers.length === 0) throw new BadRequestException()

            for (const answer of question.answers) {
                // answer.id - есть ли в БД?
                const surveyResponse = this.responseRepository.create({
                    surveyId: surveyId,
                    userId: userId,
                    questionId: question.id,
                    answerId: answer.id,
                })
                try {
                    const result = await this.responseRepository.save(surveyResponse)
                    saveResults.push(result)
                }
                catch (error) {

                }
            }
        }
        return saveResults
    }
}
