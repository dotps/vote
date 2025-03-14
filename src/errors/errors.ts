export enum ErrorsMessages {
    NOT_FOUND = "Запись не найдена.",
    USER_UPDATE_FORBIDDEN = "Нет доступа на изменение пользователя.",
    USER_NOT_FOUND = "Пользователь не найден.",
}

export class Errors {
    static displayId(id: number | string) {
        return `ID=${id}, `
    }
}