import {
    Body,
    Controller,
    Get,
    Param,
    ParseIntPipe,
    Patch,
    Post,
    Put,
    Request,
    UsePipes,
    ValidationPipe,
} from "@nestjs/common"
import {SurveyResultResponse, SurveysService} from "./surveys.service"
import {Survey} from "./survey.entity"
import {SaveSurveyResultDto} from "./save-survey-result.dto"
import {CreateAnswerDto, CreateSurveyDto, UpdateAnswerDto, UpdateSurveyDto} from "./create-survey.dto"
import {SurveyResult} from "./survey-result.entity"
import {Answer} from "./answer.entity"
import {AnswersService} from "./answers.service"

@Controller("surveys")
export class SurveysController {

    constructor(
        private surveysService: SurveysService,
        private answersService: AnswersService,
    ) {
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
        @Body() data: UpdateSurveyDto,
        @Request() request: any
    ): Promise<void> {
        const userId = request.user.id // TODO: разобраться с типами, или сделать отдельный класс CurrentUser
        return await this.surveysService.updateSurvey(data, userId, id)
    }

    @Patch(":surveyId/answers/:answerId")
    @UsePipes(ValidationPipe)
    async updateAnswer(
        @Param("surveyId", ParseIntPipe) surveyId: number,
        @Param("answerId", ParseIntPipe) answerId: number,
        @Body() data: UpdateAnswerDto,
        @Request() request: any
    ): Promise<Answer> {
        const userId = request.user.id // TODO: разобраться с типами, или сделать отдельный класс CurrentUser
        const answerDto = {
            ...data,
            id: answerId,
        }
        return await this.answersService.updateAnswer(userId, surveyId, answerDto)
    }

    @Post(":surveyId/questions/:questionId/answers")
    @UsePipes(ValidationPipe)
    async createAnswer(
        @Param("surveyId", ParseIntPipe) surveyId: number,
        @Param("questionId", ParseIntPipe) questionId: number,
        @Body() data: CreateAnswerDto,
        @Request() request: any
    ): Promise<Answer> {
        const userId = request.user.id // TODO: разобраться с типами, или сделать отдельный класс CurrentUser
        console.log(data)
        const checkUserCanCreateAnswer = true
        return await this.answersService.createAnswer(userId, surveyId, questionId, data, checkUserCanCreateAnswer)
    }
}