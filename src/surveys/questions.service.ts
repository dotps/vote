import {ForbiddenException, Injectable, NotFoundException} from "@nestjs/common"
import {InjectRepository} from "@nestjs/typeorm"
import {Repository} from "typeorm"
import {CreateQuestionDto} from "./create-survey.dto"
import {Question} from "./question.entity"
import {DbError} from "../errors/db-error"
import {Survey} from "./survey.entity"
import {Errors, ErrorsMessages} from "../errors/errors"
import {UpdateQuestionDto} from "./update-survey.dto"
import {User} from "../users/user.entity"

@Injectable()
export class QuestionsService {

    constructor(
        @InjectRepository(Survey)
        private readonly surveyRepository: Repository<Survey>,
        @InjectRepository(Question)
        private readonly questionRepository: Repository<Question>,
    ) {
    }

    async createQuestion(user: User, surveyId: number, data: CreateQuestionDto, checkCanUserCreateQuestion: boolean = false): Promise<Question> {
        if (checkCanUserCreateQuestion) await this.checkCanUserCreateQuestionOrThrowError(user, surveyId)

        const question = this.questionRepository.create({
            ...data,
            surveyId: surveyId
        })

        try {
            return await this.questionRepository.save(question)
        } catch (error) {
            DbError.handle(error)
        }
    }

    async checkCanUserCreateQuestionOrThrowError(user: User, surveyId: number): Promise<void> {
        const survey = await this.surveyRepository.findOne({
            select: ["createdBy"],
            where: {id: surveyId}
        })
        if (!survey) throw new NotFoundException(Errors.displayId(surveyId) + ErrorsMessages.SURVEY_NOT_FOUND)
        if (!user.isSelf(survey?.createdBy)) throw new ForbiddenException(ErrorsMessages.QUESTION_ADD_FORBIDDEN)
    }

    async updateQuestion(user: User, surveyId: number, questionDto: UpdateQuestionDto, checkCanUserCreateQuestion: boolean = false) {
        if (checkCanUserCreateQuestion) await this.checkCanUserCreateQuestionOrThrowError(user, surveyId)
        questionDto.answers = undefined

        try {
            return await this.questionRepository.update(questionDto.id, questionDto)
        } catch (error) {
            DbError.handle(error)
        }
    }

    updateQuestionObjectFromDto(question: Question, questionDto: UpdateQuestionDto): void {
        const {id, answers, ...questionFields} = questionDto
        Object.assign(question, questionFields)
    }
}
