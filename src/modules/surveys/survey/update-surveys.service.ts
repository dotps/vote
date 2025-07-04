import {Injectable, NotFoundException} from "@nestjs/common"
import {Question} from "../../../libs/entities/question.entity"
import {Answer} from "../../../libs/entities/answer.entity"
import {AnswersService} from "../answer/answers.service"
import {QuestionsService} from "../question/questions.service"
import {Errors, ErrorsMessages} from "../../../libs/errors/errors"
import {UpdateAnswerDto, UpdateQuestionDto, UpdateSurveyDto} from "./dto/update-survey.dto"
import {Survey} from "../../../libs/entities/survey.entity"

@Injectable()
export class UpdateSurveysService {

    constructor(
        private answersService: AnswersService,
        private questionsService: QuestionsService,
    ) {
    }

    updateSurvey(survey: Survey, surveyDto: UpdateSurveyDto) {
        const {questions: questionsDto, ...surveyFields} = surveyDto

        this.updateSurveyFields(survey, surveyFields)
        this.updateQuestionsInSurvey(survey.questions, questionsDto)
    }

    private updateSurveyFields(survey: Survey, surveyFields: Partial<UpdateSurveyDto>) {
        Object.assign(survey, surveyFields)
    }

    private updateQuestionsInSurvey(questions: Question[], questionsDto: UpdateQuestionDto[]) {
        for (const questionDto of questionsDto) {
            if (questionDto.id) {
                const question = this.updateQuestion(questions, questionDto)

                for (const answerDto of questionDto.answers) {
                    if (answerDto.id) this.updateAnswer(question.answers, answerDto)
                    else this.createAnswerAndAddToQuestion(answerDto, question)
                }
            } else {
                const question = this.createQuestionFromDtoWithoutAnswers(questionDto)

                for (const answerDto of questionDto.answers) {
                    this.createAnswerAndAddToQuestion(answerDto, question)
                }
                questions.push(question)
            }
        }
    }

    private createAnswerAndAddToQuestion(answerDto: UpdateAnswerDto, question: Question) {
        const answer = this.answersService.createAnswerObjectFromDto(answerDto)
        question.answers.push(answer)
    }

    private createQuestionFromDtoWithoutAnswers(questionDto: UpdateQuestionDto): Question {
        const question = new Question()

        this.questionsService.updateQuestionObjectFromDto(question, questionDto)
        question.answers = []

        return question
    }

    private updateAnswer(answers: Answer[], answerDto: UpdateAnswerDto): Answer {
        const answer = answers.find(a => a.id === answerDto.id)
        if (!answer) throw new NotFoundException(Errors.displayId(answerDto.id) + ErrorsMessages.AnswerNotFound)

        this.answersService.updateAnswerObjectFromDto(answer, answerDto)

        return answer
    }

    private updateQuestion(questions: Question[], questionDto: UpdateQuestionDto): Question {
        const question = questions.find(q => q.id === questionDto.id)
        if (!question) throw new NotFoundException(Errors.displayId(questionDto.id) + ErrorsMessages.QuestionNotFound)

        this.questionsService.updateQuestionObjectFromDto(question, questionDto)

        return question
    }
}