import {BadRequestException, ForbiddenException, Injectable, NotFoundException} from "@nestjs/common"
import {InjectRepository} from "@nestjs/typeorm"
import {Repository} from "typeorm"
import {Survey} from "./survey.entity"
import {CreateAnswerDto, CreateSurveyDto, UpdateAnswerDto, UpdateSurveyDto} from "./create-survey.dto"
import {SaveSurveyResultDto} from "./save-survey-result.dto"
import {SurveyResult} from "./survey-result.entity"
import {DBError} from "../DBError"
import {ISurveyDto} from "./survey.dto"
import {Question} from "./question.entity"
import {Answer} from "./answer.entity"

@Injectable()
export class AnswersService {

    constructor(
        @InjectRepository(Answer)
        private readonly answerRepository: Repository<Answer>,
    ) {
    }

    async createAnswer(data: CreateAnswerDto, questionId: number): Promise<Answer> {
        // TODO: протестировать + exception
        const answer = this.answerRepository.create({
            ...data,
            questionId: questionId
        })
        return await this.answerRepository.save(answer)
    }

    // TODO: если обновлять отдельными запросами, то можно отказаться от UpdateAnswerDto в сторону 1 dto
    async updateAnswer(userId: number, surveyId: number, answerDto: UpdateAnswerDto, isReturnUpdatedData: boolean = true): Promise<Answer | null> {
        const answer = await this.getAnswerWithSurveyHierarchy(answerDto)

        if (!answer) throw new NotFoundException(`Ответ id=${answerDto.id} не найден.`)
        if (answer.question.survey.id !== surveyId || answer.question.survey.createdBy !== userId) throw new ForbiddenException("У вас нет прав на обновление этого ответа.")

        answer.title = answerDto.title
        await this.answerRepository.update(answerDto.id, answer)

        if (isReturnUpdatedData) return await this.answerRepository.findOneBy({id: answerDto.id})
        return null
    }

    private async getAnswerWithSurveyHierarchy(answerDto: UpdateAnswerDto): Promise<Answer> {
        return await this.answerRepository
            .createQueryBuilder("answer")
            .leftJoinAndSelect("answer.question", "question")
            .leftJoinAndSelect("question.survey", "survey")
            .where({id: answerDto.id})
            .getOne()
    }
}
