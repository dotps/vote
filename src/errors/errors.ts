export enum ErrorsMessages {
    NotFound = "Запись не найдена.",
    SurveyNotFound = "Опрос не найден.",
    SurveyUpdateForbidden = "Нет доступа на изменение опроса.",
    SurveyResultsNotFound = "Результаты опроса не найдены.",
    UserUpdateForbidden = "Нет доступа на изменение пользователя.",
    UserNotFound = "Пользователь не найден.",
    QuestionNotFound = "Вопрос не найден.",
    QuestionAddForbidden = "У вас нет прав на добавление вопроса к этому опросу.",
    QuestionsNotEmpty = "Вопросы не должны быть пустыми.",
    AnswerNotFound = "Ответ не найден.",
    AnswersNotEmpty = "Ответы не должны быть пустыми.",
    AuthTokenNotFound = "Отсутствует токен.",
    AuthTokenUserNotFound = "Пользователь в токене не обнаружен.",
    AuthWrongData = "Неверные данные для авторизации.",
}

export class Errors {
    static displayId(id: number | string) {
        return `ID=${id}, `
    }
}