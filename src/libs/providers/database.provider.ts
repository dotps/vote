import {TypeOrmModule} from "@nestjs/typeorm"
import {ConfigService} from "@nestjs/config"
import {User} from "../../modules/users/user.entity"
import {Config} from "../config/config"
import {Survey} from "../entities/survey.entity"
import {Question} from "../entities/question.entity"
import {Answer} from "../entities/answer.entity"
import {SurveyResult} from "../entities/survey-result.entity"

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