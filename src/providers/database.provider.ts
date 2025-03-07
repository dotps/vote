import { TypeOrmModule } from "@nestjs/typeorm"
import { ConfigService } from "@nestjs/config"
import { User } from "../users/user.entity"
import { Config } from "../config/config"
import { Survey } from "../surveys/survey.entity"
import { Question } from "../surveys/question.entity"
import { Answer } from "../surveys/answer.entity"
import { SurveyResponses } from "../surveys/survey-responses.entity"

export const databaseProvider = TypeOrmModule.forRootAsync({
  useFactory: (configService: ConfigService) => ({
    type: "postgres",
    url: configService.get<string>(Config.DATABASE_URL),
    entities: [User, Survey, Question, Answer, SurveyResponses],
    synchronize: true,
  }),
  inject: [ConfigService],
})