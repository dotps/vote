import { Module } from '@nestjs/common';
import { SurveysController } from './surveys.controller';
import { SurveysService } from './surveys.service';
import { TypeOrmModule } from "@nestjs/typeorm"
import { Survey } from "./survey.entity"
import { SurveyResult } from "./survey-result.entity"
import {Question} from "./question.entity"
import {Answer} from "./answer.entity"
import {AnswersService} from "./answers.service"
import {QuestionsService} from "./questions.service"

@Module({
  imports: [TypeOrmModule.forFeature([Survey, Question, Answer, SurveyResult])],
  controllers: [SurveysController],
  providers: [SurveysService, QuestionsService, AnswersService]
})
export class SurveysModule {}
