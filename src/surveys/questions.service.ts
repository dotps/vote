import {ForbiddenException, Injectable, NotFoundException} from "@nestjs/common"
import {InjectRepository} from "@nestjs/typeorm"
import {Repository} from "typeorm"
import {CreateQuestionDto, UpdateQuestionDto} from "./create-survey.dto"
import {Question} from "./question.entity"
import {DBError} from "../DBError"
import {Survey} from "./survey.entity"

@Injectable()
export class QuestionsService {

    constructor(
        @InjectRepository(Survey)
        private readonly surveyRepository: Repository<Survey>,
        @InjectRepository(Question)
        private readonly questionRepository: Repository<Question>,
    ) {
    }

    async createQuestion(userId: number, surveyId: number, data: CreateQuestionDto, checkCanUserCreateQuestion: boolean = false): Promise<Question> {
        if (checkCanUserCreateQuestion) await this.checkCanUserCreateQuestionOrThrowError(userId, surveyId)

        const question = this.questionRepository.create({
            ...data,
            surveyId: surveyId
        })

        try {
            return await this.questionRepository.save(question)
        } catch (error) {
            DBError.handle(error)
        }
    }

    async checkCanUserCreateQuestionOrThrowError(userId: number, surveyId: number): Promise<void> {
        const survey = await this.surveyRepository.findOne({
            select: ["createdBy"],
            where: {id: surveyId}
        })
        if (!survey) throw new NotFoundException(`Опрос id=${surveyId} не найден.`)
        if (survey?.createdBy !== userId) throw new ForbiddenException("У вас нет прав на добавление вопроса к этому опросу.")
    }

    async updateQuestion(userId: number, surveyId: number, questionDto: UpdateQuestionDto, checkCanUserCreateQuestion: boolean = false) {
        if (checkCanUserCreateQuestion) await this.checkCanUserCreateQuestionOrThrowError(userId, surveyId)


        questionDto.answers = undefined

        console.log(questionDto)

        try {
            return await this.questionRepository.update(questionDto.id, questionDto)
        } catch (error) {
            DBError.handle(error)
        }

        // const answer = await this.getAnswerWithSurveyHierarchy(answerDto)

        // if (!answer) throw new NotFoundException(`Ответ id=${questionDto.id} не найден.`)
        // if (answer?.question?.survey?.id !== surveyId || answer?.question?.survey?.createdBy !== userId) throw new ForbiddenException("У вас нет прав на обновление этого ответа.")
        //
        // answer.title = questionDto.title // TODO: тут завязано на код, надо бы answerDto использовать ,что передано, все обновлять
        // await this.answerRepository.update(answerDto.id, answer)
        //
        // if (isReturnUpdatedData) return await this.answerRepository.findOneBy({id: answerDto.id})
        // return null
    }

    updateQuestionObjectFromDto(question: Question, questionDto: UpdateQuestionDto): void {
        const {id, answers, ...questionFields} = questionDto
        Object.assign(question, questionFields)
    }
}
