import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common"
import { InjectRepository } from "@nestjs/typeorm"
import { Repository } from "typeorm"
import { Survey } from "./survey.entity"
import { CreateSurveyDto } from "./create-survey.dto"
import { SaveSurveyResultDto } from "./save-survey-result.dto"
import { SurveyResult } from "./survey-result.entity"
import { DBErrors } from "../DBErrors"

@Injectable()
export class SurveysService {

  constructor(
    @InjectRepository(Survey)
    private readonly surveyRepository: Repository<Survey>,
    @InjectRepository(SurveyResult)
    private readonly resultRepository: Repository<SurveyResult>,
  ) {
  }

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
      relations: ["questions", "questions.answers"],
    })
    if (!survey) throw new NotFoundException()
    return survey
  }

  async saveUserSurveyResult(userId: number, surveyId: number, data: SaveSurveyResultDto): Promise<SurveyResult[]> {
    if (data.questions.length === 0) throw new BadRequestException() // TODO: можно ли через ValidationPipe проверить количество?

    const saveResults: SurveyResult[] = []
    for (const question of data.questions) {
      // question.id - есть ли в БД?
      if (question.answers.length === 0) throw new BadRequestException()

      for (const answer of question.answers) {
        // answer.id - есть ли в БД?
        const surveyResult = this.resultRepository.create({
          surveyId: surveyId,
          userId: userId,
          questionId: question.id,
          answerId: answer.id,
        })
        try {
          const result = await this.resultRepository.save(surveyResult)
          saveResults.push(result)
        } catch (error) {
          if (error.code === DBErrors.RESULT_EXIST.code) {
            throw new BadRequestException(DBErrors.RESULT_EXIST.message)
          }
          throw error
        }
      }
    }
    return saveResults
  }
}
