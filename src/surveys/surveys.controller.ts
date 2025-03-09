import {
    Body,
    Controller,
    Get,
    Param,
    ParseIntPipe,
    Post,
    Put,
    Request,
    UsePipes,
    ValidationPipe,
} from "@nestjs/common"
import { SurveyResultResponse, SurveysService } from "./surveys.service"
import { Survey } from "./survey.entity"
import { SaveSurveyResultDto } from "./save-survey-result.dto"
import { CreateSurveyDto } from "./create-survey.dto"
import { SurveyResult } from "./survey-result.entity"

@Controller("surveys")
export class SurveysController {

    constructor(private surveysService: SurveysService) {
    }

    @Post()
    @UsePipes(ValidationPipe)
    async createSurvey(@Body() data: CreateSurveyDto, @Request() request: any): Promise<Survey> {
        const userId = request.user.id // TODO: разобраться с типами, или сделать отдельный класс CurrentUser
        return await this.surveysService.createSurvey(data, userId)
    }

    @Get()
    async getAllSurveys(): Promise<Survey[]> {
        return await this.surveysService.getAllSurveys()
    }

    @Get(":id")
    async getSurvey(@Param("id", ParseIntPipe) id: number): Promise<Survey> {
        return await this.surveysService.getSurvey(id)
    }

    @Get(":id/result")
    async getSurveyResult(@Param("id", ParseIntPipe) id: number): Promise<SurveyResultResponse[]> {
        return await this.surveysService.getSurveyResult(id)
    }

    @Post(":id")
    @UsePipes(ValidationPipe)
    async saveSurveyResult(
        @Param("id", ParseIntPipe) id: number,
        @Body() data: SaveSurveyResultDto,
        @Request() request: any
    ): Promise<SurveyResult[]> {
        const userId = request.user.id
        return await this.surveysService.saveUserSurveyResult(userId, id, data)
    }

    @Put(":id")
    @UsePipes(ValidationPipe)
    async updateSurvey(
      @Param("id", ParseIntPipe) id: number,
      @Body() data: CreateSurveyDto,
      @Request() request: any
    ): Promise<Survey> {
        const userId = request.user.id // TODO: разобраться с типами, или сделать отдельный класс CurrentUser
        console.log(userId)
        // console.log(data)
        return await this.surveysService.updateSurvey(data, userId, id)
    }
}