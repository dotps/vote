import {Body, Controller, Get, Param, ParseIntPipe, Post, UsePipes, ValidationPipe} from "@nestjs/common"
import {SurveysService} from "./surveys.service"
import {AnswerDto, SurveyDto} from "./surveys.dto"
import {Public} from "../auth/public.decorator"
import {UserDto, ValidationGroup} from "../users/user.dto"
import { Survey } from "./survey.entity"

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
    @UsePipes(ValidationPipe)
    async create(@Body() data: SurveyDto): Promise<Survey> {
        return await this.surveysService.createSurvey(data)
    }

    @Public() // TODO: убрать после завершения модуля
    @Get()
    async getAll(): Promise<Survey[]> {
        return await this.surveysService.getAllSurveys()
    }

    @Public() // TODO: убрать после завершения модуля
    @Get(":id")
    async get(@Param("id", ParseIntPipe) id: number): Promise<Survey> {
        return await this.surveysService.getSurvey(id)
    }
}
