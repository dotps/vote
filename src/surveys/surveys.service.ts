import {BadRequestException, ForbiddenException, Injectable, NotFoundException} from "@nestjs/common"
import {InjectRepository} from "@nestjs/typeorm"
import {Repository} from "typeorm"
import {Survey} from "./survey.entity"
import {CreateSurveyDto, UpdateAnswerDto, UpdateSurveyDto} from "./create-survey.dto"
import {SaveSurveyResultDto} from "./save-survey-result.dto"
import {SurveyResult} from "./survey-result.entity"
import {DBError} from "../DBError"
import {ISurveyDto} from "./survey.dto"
import {Question} from "./question.entity"
import {Answer} from "./answer.entity"

@Injectable()
export class SurveysService {

    constructor(
        @InjectRepository(Survey)
        private readonly surveyRepository: Repository<Survey>,
        @InjectRepository(Answer)
        private readonly answerRepository: Repository<Answer>,
        @InjectRepository(Question)
        private readonly questionRepository: Repository<Question>,
        @InjectRepository(SurveyResult)
        private readonly resultRepository: Repository<SurveyResult>,
    ) {
    }

    async createSurvey(data: CreateSurveyDto, userId: number): Promise<Survey> {
        this.addCreatedByUser(data, userId)
        const survey = this.surveyRepository.create(data)
        return await this.surveyRepository.save(survey)
    }

    async getAllSurveys(): Promise<Survey[]> {
        const surveys = await this.surveyRepository.find()
        if (surveys.length === 0) throw new NotFoundException()
        return surveys
    }

    async getSurvey(id: number): Promise<Survey> {
        const survey = await this.surveyRepository.findOne({
            where: {id: id},
            relations: ["questions", "questions.answers"],
        })
        if (!survey) throw new NotFoundException("Опрос не найден.")
        return survey
    }

    async saveUserSurveyResult(userId: number, surveyId: number, data: SaveSurveyResultDto): Promise<SurveyResult[]> {
        if (data.questions.length === 0) throw new BadRequestException() // TODO: можно ли через ValidationPipe проверить количество?

        const saveResults: SurveyResult[] = []
        for (const question of data.questions) {
            if (question.answers.length === 0) throw new BadRequestException()

            for (const answer of question.answers) {
                try {
                    const surveyResult = this.resultRepository.create({
                        surveyId: surveyId,
                        userId: userId,
                        questionId: question.id,
                        answerId: answer.id,
                    })
                    const result = await this.resultRepository.save(surveyResult)
                    saveResults.push(result)
                } catch (error) {
                    DBError.handle(error)
                }
            }
        }
        return saveResults
    }

    async getSurveyResult(id: number): Promise<SurveyResultResponse[]> {
        const results = await this.resultRepository
            .createQueryBuilder("result")
            .select("survey.title", "surveyTitle")
            .addSelect("survey.id", "surveyId")
            .addSelect("question.id", "questionId")
            .addSelect("question.title", "questionTitle")
            .addSelect("answer.id", "answerId")
            .addSelect("answer.title", "answerTitle")
            .addSelect("COUNT(result.id)", "answerCount")
            .innerJoin("result.survey", "survey")
            .innerJoin("result.question", "question")
            .innerJoin("result.answer", "answer")
            .where("result.surveyId = :surveyId", {surveyId: id})
            .groupBy("survey.id, survey.title, question.id, question.Title, answer.id, answer.Title")
            .orderBy("question.id, answer.id")
            .getRawMany()

        if (!results || results.length === 0) throw new NotFoundException()
        return results as SurveyResultResponse[]
    }

    private addCreatedByUser(data: ISurveyDto, userId: number) {
        data["createdBy"] = userId
    }

    async updateSurvey(surveyDto: UpdateSurveyDto, userId: number, surveyId: number): Promise<void> {
        const survey = await this.getSurvey(surveyId)
        if (!survey) throw new NotFoundException()
        if (survey.createdBy !== userId) throw new ForbiddenException()

        // console.log(survey)
        // console.log(surveyDto)

        survey.title = surveyDto.title
        survey.description = surveyDto.description

        for (const questionDto of surveyDto.questions) {
            let question: Question

            if (questionDto.id) {
                console.log("questionDto.id = ", questionDto.id)
                // TODO: продолжить
                // Что делать с вопросом который не передали: удалять / не трогать ??
                // т.к. на фронтенде может быть возможность удаления вопроса / ответа
                // или удаление реализовывать через отдельный маршрут, а обновлять только то что передано (так проще)
                // console.log(questionDto.id)
                question = survey.questions.find(q => q.id === questionDto.id)
                const surveyQuestion = survey.questions.find(q => q.id === questionDto.id)
                // console.log("surveyQuestion", surveyQuestion)
                if (!question) throw new NotFoundException(`Вопрос id=${questionDto.id} не найден.`)
            } else {
                question = new Question()
                survey.questions.push(question)
            }

            console.log("questionDto.id = ", questionDto.id, "question.id = ", question.id)

            question.title = questionDto.title
            question.answers = question.answers || []

            for (const answerDto of questionDto.answers) {
                let answer: Answer

                // await this.updateAnswer(answerDto, question.answers, question)

                // if (answerDto.id) {
                //     console.log("answerDto", answerDto.id)
                //     answer = question.answers.find(a => a.id === answerDto.id)
                //     if (!answer) throw new NotFoundException(`Ответ id=${answerDto.id} не найден.`)
                // } else {
                //     answer = new Answer()
                // }
                //
                // answer.title = answerDto.title
                // question.answers.push(answer)
            }
        }

        // console.log(survey)

        // await this.surveyRepository.save(survey)
    }

    /*
    // TODO: если обновлять отдельными запросами, то можно отказаться от UpdateAnswerDto в сторону 1 dto
    async updateAnswer(answerDto: UpdateAnswerDto, answers: Answer[], question: Question): Promise<void> {

        if (!question.id) throw new NotFoundException(`Вопрос не найден.`)

        let answer: Answer

        if (!answerDto.id) {
            answer = new Answer()
        }
        else {
            // if (answers.length === 0 ) // TODO: получить список ответов из БД для индивидуального использования в  маршруте /surveys/1/answers/1
            answer = answers.find(a => a.id === answerDto.id)
            if (!answer) throw new NotFoundException(`Ответ id=${answerDto.id} не найден.`)
        }

        answer.title = answerDto.title
        answer.question = question // это важное условие

        await this.answerRepository.save(answer)
    }*/

    // TODO: перенести в AnswerService
    async updateAnswer(userId: number, surveyId: number, answerId: number, answerDto: UpdateAnswerDto): Promise<Answer> {

        const answer = await this.answerRepository
            .createQueryBuilder("answer")
            .leftJoinAndSelect("answer.question", "question")
            .leftJoinAndSelect("question.survey", "survey")
            .where({id: answerId})
            .getOne()

        if (!answer) throw new NotFoundException(`Ответ id=${answerDto.id} не найден.`)
        if (answer.question.survey.id !== surveyId || answer.question.survey.createdBy !== userId) throw new ForbiddenException("У вас нет прав на обновление этого ответа.")

        answer.title = answerDto.title
        await this.answerRepository.update(answerId, answer)
        return await this.answerRepository.findOneBy({id: answerId})
    }

}

export type SurveyResultResponse = {
    surveyId: number,
    surveyTitle: string,
    questionId: number,
    questionTitle: string,
    answerId: number,
    answerTitle: string,
    answerCount: number
}
