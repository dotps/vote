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
        // @InjectRepository(SurveyResponses)
        private readonly surveyRepository: Repository<Survey>,
        // private readonly responseRepository: Repository<SurveyResponses>,
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

    async saveUserSurveyResponse(userId: number, surveyId: number, data: SaveSurveyResponseDto): Promise<Survey> {
        console.log(userId)
        console.log(data)

        if (data.questions.length === 0) throw new BadRequestException() // TODO: можно ли через ValidationPipe проверить количество?
        for (const question of data.questions) {
            // question.id - есть ли в БД?
            console.log(question)
            if (question.answers.length === 0) throw new BadRequestException()
            for (const answer of question.answers) {
                console.log(answer.id)
                // answer.id - есть ли в БД?

                const surveyResponse = new SurveyResponses()
                surveyResponse.surveyId = surveyId
                // surveyResponse.userId = userId
                surveyResponse.questionId = question.id
                surveyResponse.answerId = answer.id
                // TODO: продолжить
                console.log(surveyResponse)
                // await surveyResponse.save()

            }
        }
        // TODO: сохранить в SurveyResponses
        // data.questions
        // return await this.repository.save(data)
        return undefined
    }
}
