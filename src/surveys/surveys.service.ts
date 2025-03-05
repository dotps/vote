import { Injectable } from '@nestjs/common';
import { SurveyDto } from "./surveys.dto"
import { InjectRepository } from "@nestjs/typeorm"
import { Repository } from "typeorm"
import { Survey } from "./survey.entity"

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
}
