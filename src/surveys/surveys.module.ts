import { Module } from '@nestjs/common';
import { SurveysController } from './surveys.controller';
import { SurveysService } from './surveys.service';
import { TypeOrmModule } from "@nestjs/typeorm"
import { Survey } from "./survey.entity"
import { SurveyResult } from "./survey-result.entity"

@Module({
  imports: [TypeOrmModule.forFeature([Survey, SurveyResult])],
  controllers: [SurveysController],
  providers: [SurveysService]
})
export class SurveysModule {}
