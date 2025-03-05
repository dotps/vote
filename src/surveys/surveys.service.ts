import {Injectable, NotFoundException} from "@nestjs/common"
import {SurveyDto} from "./surveys.dto"
import {InjectRepository} from "@nestjs/typeorm"
import {Repository} from "typeorm"
import {Survey} from "./survey.entity"

@Injectable()
export class SurveysService {

    constructor(
        @InjectRepository(Survey)
        private readonly repository: Repository<Survey>,
    ) {}

    async createSurvey(data: SurveyDto): Promise<Survey> {
        const survey = this.repository.create(data)
        return await this.repository.save(survey)
    }

    async getAllSurveys(): Promise<Survey[]> {
        const surveys = await this.repository.find()
        if (surveys.length === 0) throw new NotFoundException()
        return surveys
    }

    async getSurvey(id: number): Promise<Survey> {
        const survey = await this.repository.findOne({
            where: { id: id },
            relations: ['questions', 'questions.answers']
        })
        if (!survey) throw new NotFoundException()
        return survey
    }
}
