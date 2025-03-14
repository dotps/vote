import {UpdateResult} from "typeorm"

export class Responses {

    static update(result: UpdateResult): Promise<ResponseResult> {
        const response = result?.affected ? { status: "success" } : { status: "unaffected" }
        return Promise.resolve(response)
    }
}

export type ResponseResult = {
    status: string
}