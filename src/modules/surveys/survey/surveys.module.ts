import {Module} from "@nestjs/common"
import {SurveysController} from "./surveys.controller"
import {SurveysService} from "./surveys.service"
import {TypeOrmModule} from "@nestjs/typeorm"
import {Survey} from "../../../libs/entities/survey.entity"
import {SurveyResult} from "../../../libs/entities/survey-result.entity"
import {Question} from "../../../libs/entities/question.entity"
import {Answer} from "../../../libs/entities/answer.entity"
import {AnswersService} from "../answer/answers.service"
import {QuestionsService} from "../question/questions.service"
import {UpdateSurveysService} from "./update-surveys.service"

@Module({
    imports: [TypeOrmModule.forFeature([Survey, Question, Answer, SurveyResult])],
    controllers: [SurveysController],
    providers: [SurveysService, QuestionsService, AnswersService, UpdateSurveysService]
})
export class SurveysModule {
}
