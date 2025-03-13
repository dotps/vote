import {ForbiddenException, Injectable, NotFoundException} from "@nestjs/common"
import {InjectRepository} from "@nestjs/typeorm"
import {Repository} from "typeorm"
import {CreateAnswerDto, UpdateAnswerDto} from "./create-survey.dto"
import {Answer} from "./answer.entity"
import {Question} from "./question.entity"
import {DBError} from "../DBError"

@Injectable()
export class AnswersService {

    constructor(
        @InjectRepository(Answer)
        private readonly answerRepository: Repository<Answer>,
        @InjectRepository(Question)
        private readonly questionRepository: Repository<Question>,
    ) {
    }

    async createAnswer(userId: number, surveyId: number, questionId: number, data: CreateAnswerDto, checkUserCanCreateAnswer: boolean = false): Promise<Answer> {

        if (checkUserCanCreateAnswer) {
            const question = await this.getQuestionWithSurveyHierarchy(questionId)
            if (!question) throw new NotFoundException(`Вопрос id=${questionId} не найден.`)
            if (question?.survey?.id !== surveyId || question?.survey?.createdBy !== userId) throw new ForbiddenException("У вас нет прав на добавление ответа к этому вопросу.")
        }

        const answer = this.createAnswerObjectFromDto(data)
        answer.questionId = questionId

        try {
            return await this.answerRepository.save(answer)
        } catch (error) {
            DBError.handle(error)
        }
    }

    // TODO: если обновлять отдельными запросами, то можно отказаться от UpdateAnswerDto в сторону 1 dto
    async updateAnswer(userId: number, surveyId: number, answerDto: UpdateAnswerDto, isReturnUpdatedData: boolean = true): Promise<Answer | null> {
        const answer = await this.getAnswerWithSurveyHierarchy(answerDto)

        if (!answer) throw new NotFoundException(`Ответ id=${answerDto.id} не найден.`)
        if (answer?.question?.survey?.id !== surveyId || answer?.question?.survey?.createdBy !== userId) throw new ForbiddenException("У вас нет прав на обновление этого ответа.")

        this.updateAnswerObjectFromDto(answer, answerDto)
        await this.answerRepository.update(answerDto.id, answer)

        if (isReturnUpdatedData) {
            return await this.answerRepository.findOneBy({id: answerDto.id})
        }

        return null
    }

    private async getAnswerWithSurveyHierarchy(answerDto: UpdateAnswerDto): Promise<Answer> {
        console.log("getAnswerWithSurveyHierarchy")
        return await this.answerRepository
            .createQueryBuilder("answer")
            .leftJoinAndSelect("answer.question", "question")
            .leftJoinAndSelect("question.survey", "survey")
            .where({id: answerDto.id})
            .getOne()
    }

    private async getQuestionWithSurveyHierarchy(questionId: number): Promise<Question> {
        return await this.questionRepository
            .createQueryBuilder("question")
            .leftJoinAndSelect("question.survey", "survey")
            .where({id: questionId})
            .getOne()
    }

    createAnswerObjectFromDto(answerDto: CreateAnswerDto | UpdateAnswerDto): Answer {
        const answer = new Answer()
        this.updateAnswerObjectFromDto(answer, answerDto)
        return answer
    }

    updateAnswerObjectFromDto(answer: Answer, answerDto: CreateAnswerDto | UpdateAnswerDto): void {
        if ("id" in answerDto) {
            const {id, ...answerFields} = answerDto
            Object.assign(answer, answerFields)
        }
        else {
            Object.assign(answer, answerDto)
        }
    }
}
