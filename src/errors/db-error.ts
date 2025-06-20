import {BadRequestException} from "@nestjs/common"

export class DbError {
    static handle(error: any) {
        const code: string = error?.code?.toString() || ""
        if (!code || !errors[code]) throw error

        const exceptionMethod = errors[code].exception || BadRequestException
        const message = errors[code].message || null

        throw new exceptionMethod(message)
    }
}

const errors: ErrorsType = {
    "23505": {
        message: "Такая запись уже присутствует в БД.",
        exception: BadRequestException
    },
    "23503": {message: "Такая запись не найдена в БД."}
}

type ErrorsType = {
    [key: string]: {
        message: string
        exception?: ExceptionType
    }
}

type ExceptionType = new (message?: string) => Error
