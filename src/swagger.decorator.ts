import { applyDecorators } from "@nestjs/common"
import { ApiOperation, ApiResponse, ApiBody, ApiParam, getSchemaPath } from "@nestjs/swagger"
import { UserDto } from "./users/user.dto"
import { AuthDto } from "./auth/auth.dto"
import { CreateSurveyDto } from "./surveys/create-survey.dto"
import { Survey } from "./surveys/survey.entity"
import { SurveyResultResponse } from "./surveys/surveys.service"
import { SaveSurveyResultDto } from "./surveys/save-survey-result.dto"
import { SurveyResult } from "./surveys/survey-result.entity"

export function ApiCreateUser() {
  return applyDecorators(
    ApiResponse({ status: 201, description: "Пользователь успешно создан.", type: AuthDto }),
    ApiResponse({ status: 400, description: "Неверные данные." }),
    ApiBody({ type: UserDto }),
  )
}

export function ApiCreateSurvey() {
  return applyDecorators(
    ApiOperation({ summary: "Создание нового опроса." }),
    ApiResponse({ status: 201, description: "Опрос успешно создан.", type: Survey }),
    ApiResponse({ status: 400, description: "Неверные данные." }),
    ApiBody({ type: CreateSurveyDto }),
  )
}

export function ApiGetAllSurveys() {
  return applyDecorators(
    ApiOperation({ summary: "Получить все доступные для взаимодействия опросы." }),
    ApiResponse({ status: 200, description: "Список опросов с вопросами и ответами.", isArray: true, type: Survey }),
    ApiResponse({ status: 404, description: "Опросы не найдены." }),
  )
}

export function ApiGetSurvey() {
  return applyDecorators(
    ApiOperation({ summary: "Получить доступный для взаимодействия опрос." }),
    ApiParam({ name: "id", type: Number, description: "ID опроса, целое число" }),
    ApiResponse({ status: 200, description: "Опрос с вопросами и ответами.", type: Survey }),
    ApiResponse({ status: 404, description: "Опрос не найден." }),
  )
}

export function ApiGetSurveyResult() {
  return applyDecorators(
    ApiOperation({ summary: "Получить результаты опроса." }),
    ApiParam({ name: "id", type: Number, description: "ID опроса, целое число" }),
    ApiResponse({ status: 200, description: "Результат опроса с вопросами, ответами и сколько раз были даны ответы.", isArray: true, type: SurveyResultResponse }),
    ApiResponse({ status: 404, description: "Результаты опроса не найдены." }),
  )
}

export function ApiSaveSurveyResult() {
  return applyDecorators(
    ApiOperation({ summary: "Сохранить результаты опроса." }),
    ApiParam({ name: "id", type: Number, description: "ID опроса, целое число" }),
    ApiBody({ type: SaveSurveyResultDto }),
    ApiResponse({ status: 200, description: "", isArray: true, type: SurveyResult }),
    ApiResponse({ status: 400, description: "Возможные ошибки: Не переданы вопросы и/или ответы. Ошибка сохранения связанных записей (пользователь, опрос, вопрос, ответ) в БД." }),
    ApiResponse({ status: 401, description: "Только авторизованные пользователи могут голосовать." }),
    ApiResponse({ status: 404, description: "Опрос не найден." }),
  )
}

export function ApiAuthLogin() {
  return applyDecorators(
    ApiResponse({ status: 200, description: "Пользователь успешно авторизован.", type: AuthDto }),
    ApiResponse({ status: 401, description: "Неверные данные." }),
    ApiResponse({ status: 404, description: "Пользователь не найден." }),
    ApiBody({ type: UserDto }),
  )
}
