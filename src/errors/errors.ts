export enum ErrorsMessages {
    NOT_FOUND = "Запись не найдена.",
    SURVEY_NOT_FOUND = "Опрос не найден.",
    SURVEY_UPDATE_FORBIDDEN = "Нет доступа на изменение опроса.",
    SURVEY_RESULTS_NOT_FOUND = "Результаты опроса не найдены.",
    USER_UPDATE_FORBIDDEN = "Нет доступа на изменение пользователя.",
    USER_NOT_FOUND = "Пользователь не найден.",
    QUESTION_NOT_FOUND = "Вопрос не найден.",
    QUESTION_ADD_FORBIDDEN = "У вас нет прав на добавление вопроса к этому опросу.",
    QUESTIONS_NOT_EMPTY = "Вопросы не должны быть пустыми.",
    ANSWER_NOT_FOUND = "Ответ не найден.",
    ANSWERS_NOT_EMPTY = "Ответы не должны быть пустыми.",
    AUTH_TOKEN_NOT_FOUND = "Отсутствует токен.",
    AUTH_TOKEN_USER_NOT_FOUND = "Пользователь в токене не обнаружен.",
    AUTH_WRONG_DATA = "Неверные данные для авторизации.",
}

export class Errors {
    static displayId(id: number | string) {
        return `ID=${id}, `
    }
}