import {Body, Controller, Post, UsePipes, ValidationPipe} from '@nestjs/common';
import {SurveysService} from "./surveys.service"
import {AnswerDto, SurveyDto} from "./surveys.dto"
import {Public} from "../auth/public.decorator"
import {UserDto, ValidationGroup} from "../users/user.dto"

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
    // Авторизованный пользователь может создать новый опрос,
    // заполнив название, описание, вопросы и варианты ответов.
    // Опрос сохраняется в базе данных и становится доступным для других пользователей.
    @Public() // TODO: убрать после завершения модуля
    @Post()
    // @UsePipes(new ValidationPipe({ groups: [ValidationGroup.CREATE] }))
    @UsePipes(ValidationPipe)
    async create(@Body() data: SurveyDto): Promise<void> {
        console.log(data)

        // return await this.surveysService.createSurvey(data)
    }
}
