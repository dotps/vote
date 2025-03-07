import {Body, Controller, Get, Param, ParseIntPipe, Post, Request, UsePipes, ValidationPipe} from "@nestjs/common"
import {SurveysService} from "./surveys.service"
import {Public} from "../auth/public.decorator"
import {Survey} from "./survey.entity"
import {SaveSurveyResponseDto} from "./save-survey-response.dto"
import {CreateSurveyDto} from "./create-survey.dto"
import { SurveyResponses } from "./survey-responses.entity"

@Controller("surveys")
export class SurveysController {

    constructor(private surveysService: SurveysService) {
    }

    @Public() // TODO: убрать после завершения модуля
    @Post()
    @UsePipes(ValidationPipe)
    async createSurvey(@Body() data: CreateSurveyDto): Promise<Survey> {
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
    @UsePipes(ValidationPipe)
    async saveUserSurveyResponse(
        @Param("id", ParseIntPipe) id: number,
        @Body() data: SaveSurveyResponseDto,
        @Request() request
    ): Promise<SurveyResponses[]> {
        // const userId = request.user.id
        const userId = 1
        return await this.surveysService.saveUserSurveyResponse(userId, id, data)
    }
}