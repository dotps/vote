import {UpdateResult} from "typeorm"
import {ApiProperty} from "@nestjs/swagger"

enum UpdateStatus {
    Success = "success",
    Unaffected = "unaffected",
}

export class Responses {

    static update(result: UpdateResult): Promise<ResponseUpdateDto> {
        const response: ResponseUpdateDto = result?.affected ? {status: UpdateStatus.Success} : {status: UpdateStatus.Unaffected}
        return Promise.resolve(response)
    }

}

export class ResponseUpdateDto {
    @ApiProperty({description: "Статус", example: UpdateStatus.Success, enum: UpdateStatus})
    status: string
}