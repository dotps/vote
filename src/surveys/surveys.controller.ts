import {
    BadRequestException,
    Body,
    Controller,
    Get,
    Param,
    ParseIntPipe,
    Post,
    UsePipes,
    ValidationPipe,
} from "@nestjs/common"
import {SurveysService} from "./surveys.service"
import { AnswerDto, QuestionDto, SurveyDto } from "./surveys.dto"
import {Public} from "../auth/public.decorator"
import {UserDto} from "../users/user.dto"
import { Survey } from "./survey.entity"
import { ValidationGroup } from "../ValidationGroup"

/*
{
    "title": "title",
    "description": "description",
    "questions": [
        {
            "title": "title",
            "answers": [
                {
                    "title": "title"
                }
            ]
        }
    ]
}

 */

@Controller('surveys')
export class SurveysController {

    constructor(private surveysService: SurveysService) {}

    @Public() // TODO: убрать после завершения модуля
    @Post()
    // @UsePipes(new ValidationPipe({ groups: [ValidationGroup.CREATE] }))
    // @UsePipes(ValidationPipe)
    async createSurvey(@Body() data: SurveyDto): Promise<Survey> {
        console.log("createSurvey")
        console.log(data)
        return await this.surveysService.createSurvey(data)
    }

    @Public() // TODO: убрать после завершения модуля
    @Get()
    async getAllSurveys(): Promise<Survey[]> {
        return await this.surveysService.getAllSurveys()
    }

    @Public() // TODO: убрать после завершения модуля
    @Get(":id")
    async getSurvey(@Param("id", ParseIntPipe) id: number): Promise<Survey> {
        return await this.surveysService.getSurvey(id)
    }

    @Public() // TODO: убрать после завершения модуля
    @Post(":id")
    @UsePipes(new ValidationPipe({ groups: [ValidationGroup.SURVEY_SAVE_RESPONSE] }))
    // async saveUserSurveyResponse(@Param("id", ParseIntPipe) id: number, @Body() data: QuestionDto): Promise<any> {
    async saveUserSurveyResponse(@Param("id", ParseIntPipe) id: number, @Body() data: SurveyDto): Promise<any> {
        console.log(id, data)
        return data
        // TODO: продолжить
        // return await this.surveysService.saveUserSurveyResponse(id, data)
        /*
        {
            "questions": [
                {
                    "id": 1,
                    "answers": [
                        { id: 1 },
                        { id: 2 },
                    ]
                }
        }
        */
    }
}
