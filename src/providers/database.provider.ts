import {TypeOrmModule} from "@nestjs/typeorm"
import {ConfigService} from "@nestjs/config"
import {User} from "../users/user.entity"
import {Config} from "../config/config"
import {Survey} from "../surveys/survey/survey.entity"
import {Question} from "../surveys/question/question.entity"
import {Answer} from "../surveys/answer/answer.entity"
import {SurveyResult} from "../surveys/survey/survey-result.entity"

export const databaseProvider = TypeOrmModule.forRootAsync({
    useFactory: (configService: ConfigService) => ({
        type: "postgres",
        url: configService.get<string>(Config.DatabaseUrl),
        entities: [User, Survey, Question, Answer, SurveyResult],
        synchronize: true,
        logging: false,
    }),
    inject: [ConfigService],
})