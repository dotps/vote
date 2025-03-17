import {applyDecorators} from "@nestjs/common"
import {ApiOperation, ApiResponse, ApiBody, ApiParam, getSchemaPath} from "@nestjs/swagger"
import {UserDto} from "./users/user.dto"
import {AuthDto} from "./auth/auth.dto"
import {CreateSurveyDto} from "./surveys/create-survey.dto"
import {Survey} from "./surveys/survey.entity"
import {SurveyResultResponse} from "./surveys/surveys.service"
import {SaveSurveyResultDto} from "./surveys/save-survey-result.dto"
import {SurveyResult} from "./surveys/survey-result.entity"
import {User} from "./users/user.entity"

export function ApiCreateUser() {
    return applyDecorators(
        ApiOperation({
            summary: "Создание нового пользователя.",
            description: "Для создания пользователя, необходимо отправить (имя, email, пароль), возвращается JWT-токен для дальнейшего доступа к системе."
        }),
        ApiResponse({status: 201, description: "Пользователь успешно создан.", type: AuthDto}),
        ApiResponse({status: 400, description: "Неверные данные. Валидация данных по типу и содержимому."}),
        ApiBody({type: UserDto}),
    )
}

export function ApiUpdateUser() {
    return applyDecorators(
        ApiOperation({
            summary: "Обновить все данные пользователя.",
            description: "Для обновления данных пользователя, необходимо отправить (имя, email, пароль). Все поля обязательны."
        }),
        ApiResponse({status: 200, description: "Пользователь успешно обновлен.", type: User}),
        ApiResponse({status: 400, description: "Неверные данные. Валидация данных по типу и содержимому."}),
        ApiResponse({status: 401, description: "Требуется авторизация."}),
        ApiResponse({status: 403, description: "Пользователь может обновить только свои данные."}),
        ApiResponse({status: 404, description: "Пользователь не найден."}),
        ApiBody({type: UserDto}),
    )
}

export function ApiPartialUpdateUser() {
    return applyDecorators(
        ApiOperation({
            summary: "Частичное обновление данных пользователя.",
            description: "Для обновления данных пользователя, необходимо отправить (имя, email, пароль). Поля опциональны."
        }),
        ApiResponse({status: 200, description: "Пользователь успешно обновлен.", type: User}),
        ApiResponse({status: 400, description: "Неверные данные. Валидация данных по типу и содержимому."}),
        ApiResponse({status: 401, description: "Требуется авторизация."}),
        ApiResponse({status: 403, description: "Пользователь может обновить только свои данные."}),
        ApiResponse({status: 404, description: "Пользователь не найден."}),
        ApiBody({type: UserDto}),
    )
}

export function ApiCreateSurvey() {
    return applyDecorators(
        ApiOperation({
            summary: "Создание нового опроса.",
            description: "Ожидает весь опрос с вопросами и ответами."
        }),
        ApiResponse({status: 201, description: "Опрос успешно создан.", type: Survey}),
        ApiResponse({status: 400, description: "Неверные данные."}),
        ApiBody({type: CreateSurveyDto}),
    )
}

export function ApiGetAllSurveys() {
    return applyDecorators(
        ApiOperation({
            summary: "Получить все доступные для взаимодействия опросы.",
            description: "Отдает открытые для взаимодействия (enabled=true) опросы пользователей системы."
        }),
        ApiResponse({status: 200, description: "Список опросов с вопросами и ответами.", isArray: true, type: Survey}),
        ApiResponse({status: 404, description: "Опросы не найдены."}),
    )
}

export function ApiGetSurvey() {
    return applyDecorators(
        ApiOperation({
            summary: "Получить доступный для взаимодействия опрос.",
            description: "Отдает запрошенный по ID и доступный для взаимодействия (enabled=true) опрос."
        }),
        ApiParam({name: "id", type: Number, description: "ID опроса, целое число"}),
        ApiResponse({status: 200, description: "Опрос с вопросами и ответами.", type: Survey}),
        ApiResponse({status: 404, description: "Опрос не найден."}),
    )
}

export function ApiGetSurveyResult() {
    return applyDecorators(
        ApiOperation({summary: "Получить результаты опроса."}),
        ApiParam({name: "id", type: Number, description: "ID опроса, целое число"}),
        ApiResponse({
            status: 200,
            description: "Результат опроса с вопросами, ответами и сколько раз были даны ответы.",
            isArray: true,
            type: SurveyResultResponse
        }),
        ApiResponse({status: 404, description: "Результаты опроса не найдены."}),
    )
}

export function ApiSaveSurveyResult() {
    return applyDecorators(
        ApiOperation({summary: "Сохранить результаты опроса."}),
        ApiParam({name: "id", type: Number, description: "ID опроса, целое число"}),
        ApiBody({type: SaveSurveyResultDto}),
        ApiResponse({status: 200, description: "", isArray: true, type: SurveyResult}),
        ApiResponse({
            status: 400,
            description: "Возможные ошибки: Не переданы вопросы и/или ответы. Ошибка сохранения связанных записей (пользователь, опрос, вопрос, ответ) в БД."
        }),
        ApiResponse({status: 401, description: "Только авторизованные пользователи могут голосовать."}),
        ApiResponse({status: 404, description: "Опрос не найден."}),
    )
}

export function ApiAuthLogin() {
    return applyDecorators(
        ApiOperation({
            summary: "Авторизация пользователя.",
            description: "Для авторизации необходимо отправить (имя, пароль)."
        }),
        ApiResponse({status: 200, description: "Пользователь успешно авторизован.", type: AuthDto}),
        ApiResponse({status: 401, description: "Неверные данные."}),
        ApiResponse({status: 404, description: "Пользователь не найден."}),
        ApiBody({type: UserDto}),
    )
}

export function ApiAuthProfile() {
    return applyDecorators(
        ApiOperation({summary: "Профиль текущего пользователя."}),
        ApiResponse({status: 200, description: "Данные пользователя.", type: User}),
        ApiResponse({status: 401, description: "Требуется авторизация."}),
    )
}
