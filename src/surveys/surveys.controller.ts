import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Put,
  UsePipes,
  ValidationPipe,
} from "@nestjs/common"
import { SurveyResultResponse, SurveysService } from "./surveys.service"
import { Survey } from "./survey.entity"
import { SaveSurveyResultDto } from "./save-survey-result.dto"
import {
  CreateAnswerDto,
  CreateSurveyDto,
} from "./create-survey.dto"
import { SurveyResult } from "./survey-result.entity"
import { Answer } from "./answer.entity"
import { AnswersService } from "./answers.service"
import { CurrentUser } from "../users/current-user.decorator"
import { User } from "../users/user.entity"
import { ResponseResult } from "../responses/Responses"
import { UpdateAnswerDto, UpdateSurveyDto, UpdateSurveyStatusDto } from "./update-survey.dto"
import {
  ApiCreateSurvey,
  ApiGetAllSurveys,
  ApiGetSurvey,
  ApiGetSurveyResult,
  ApiSaveSurveyResult,
} from "../swagger.decorator"
import { ApiBearerAuth, ApiResponse, ApiTags } from "@nestjs/swagger"

@Controller("surveys")
@ApiTags("surveys")
@ApiResponse({ status: 401, description: "Требуется авторизация." })
export class SurveysController {

  constructor(
    private surveysService: SurveysService,
    private answersService: AnswersService,
  ) {
  }

  @Post()
  @UsePipes(ValidationPipe)
  @ApiCreateSurvey()
  @ApiBearerAuth()
  async createSurvey(@Body() data: CreateSurveyDto, @CurrentUser() user: User): Promise<Survey> {
    return await this.surveysService.createSurvey(data, user.id)
  }

  @Get()
  @ApiGetAllSurveys()
  async getAllSurveys(): Promise<Survey[]> {
    return await this.surveysService.getAllSurveys()
  }

  @Get(":id")
  @ApiGetSurvey()
  async getSurvey(@Param("id", ParseIntPipe) id: number): Promise<Survey> {
    return await this.surveysService.getSurvey(id)
  }

  @Get(":id/result")
  @ApiGetSurveyResult()
  async getSurveyResult(@Param("id", ParseIntPipe) id: number): Promise<SurveyResultResponse[]> {
    return await this.surveysService.getSurveyResult(id)
    // TODO: не очень информативное название ответа, указать про подсчет голосов
    // TODO: протестировать после замены типа на класс
  }

  @Post(":id")
  @UsePipes(ValidationPipe)
  @ApiSaveSurveyResult()
  async saveSurveyResult(
    @Param("id", ParseIntPipe) id: number,
    @Body() data: SaveSurveyResultDto,
    @CurrentUser() user: User,
  ): Promise<SurveyResult[]> {
    return await this.surveysService.saveUserSurveyResult(user.id, id, data)
  }

  @Put(":id")
  @UsePipes(ValidationPipe)
  async updateSurvey(
    @Param("id", ParseIntPipe) id: number,
    @Body() data: UpdateSurveyDto,
    @CurrentUser() user: User,
  ): Promise<void> {
    return await this.surveysService.updateSurvey(data, user.id, id)
  }

  @Patch(":surveyId/answers/:answerId")
  @UsePipes(ValidationPipe)
  async updateAnswer(
    @Param("surveyId", ParseIntPipe) surveyId: number,
    @Param("answerId", ParseIntPipe) answerId: number,
    @Body() data: UpdateAnswerDto,
    @CurrentUser() user: User,
  ): Promise<Answer> {
    const answerDto = {
      ...data,
      id: answerId,
    }
    return await this.answersService.updateAnswer(user.id, surveyId, answerDto)
  }

  @Post(":surveyId/questions/:questionId/answers")
  @UsePipes(ValidationPipe)
  async createAnswer(
    @Param("surveyId", ParseIntPipe) surveyId: number,
    @Param("questionId", ParseIntPipe) questionId: number,
    @Body() data: CreateAnswerDto,
    @CurrentUser() user: User,
  ): Promise<Answer> {
    const checkUserCanCreateAnswer = true
    return await this.answersService.createAnswer(user.id, surveyId, questionId, data, checkUserCanCreateAnswer)
  }

  @Patch(":surveyId/status")
  @UsePipes(ValidationPipe)
  async setSurveyActive(
    @Param("surveyId", ParseIntPipe) surveyId: number,
    @Body() data: UpdateSurveyStatusDto,
    @CurrentUser() user: User,
  ): Promise<ResponseResult> {
    return await this.surveysService.setSurveyActive(user.id, surveyId, data.status)
  }
}