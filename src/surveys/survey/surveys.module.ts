import {Module} from "@nestjs/common"
import {SurveysController} from "./surveys.controller"
import {SurveysService} from "./surveys.service"
import {TypeOrmModule} from "@nestjs/typeorm"
import {Survey} from "./survey.entity"
import {SurveyResult} from "./survey-result.entity"
import {Question} from "../question/question.entity"
import {Answer} from "../answer/answer.entity"
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
