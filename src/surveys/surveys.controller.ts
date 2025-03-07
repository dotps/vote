import {Body, Controller, Get, Param, ParseIntPipe, Post, Request, UsePipes, ValidationPipe} from "@nestjs/common"
import {SurveysService} from "./surveys.service"
import {Survey} from "./survey.entity"
import {SaveSurveyResultDto} from "./save-survey-result.dto"
import {CreateSurveyDto} from "./create-survey.dto"
import {SurveyResult} from "./survey-result.entity"

@Controller("surveys")
export class SurveysController {

    constructor(private surveysService: SurveysService) {
    }

    @Post()
    @UsePipes(ValidationPipe)
    async createSurvey(@Body() data: CreateSurveyDto): Promise<Survey> {
        return await this.surveysService.createSurvey(data)
    }

    @Get()
    async getAllSurveys(): Promise<Survey[]> {
        return await this.surveysService.getAllSurveys()
    }

    @Get(":id")
    async getSurvey(@Param("id", ParseIntPipe) id: number): Promise<Survey> {
        return await this.surveysService.getSurvey(id)
    }

    @Post(":id")
    @UsePipes(ValidationPipe)
    async saveUserSurveyResponse(
        @Param("id", ParseIntPipe) id: number,
        @Body() data: SaveSurveyResultDto,
        @Request() request
    ): Promise<SurveyResult[]> {
        // const userId = request.user.id
        const userId = 1
        return await this.surveysService.saveUserSurveyResult(userId, id, data)
    }
}