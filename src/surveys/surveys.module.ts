import { Module } from '@nestjs/common';
import { SurveysController } from './surveys.controller';
import { SurveysService } from './surveys.service';
import { TypeOrmModule } from "@nestjs/typeorm"
import { Survey } from "./survey.entity"
import { SurveyResponses } from "./survey-responses.entity"

@Module({
  imports: [TypeOrmModule.forFeature([Survey, SurveyResponses])],
  controllers: [SurveysController],
  providers: [SurveysService]
})
export class SurveysModule {}
