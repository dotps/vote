import {Test, TestingModule} from "@nestjs/testing"
import {SurveysController} from "../src/surveys/surveys.controller"
import {SurveysService} from "../src/surveys/surveys.service"
import {AnswersService} from "../src/surveys/answers.service"
import {Survey} from "../src/surveys/survey.entity"
import {CreateSurveyDto} from "../src/surveys/create-survey.dto"
import {UpdateSurveyDto, UpdateSurveyStatusDto} from "../src/surveys/update-survey.dto"
import {ForbiddenException, ValidationPipe, BadRequestException} from "@nestjs/common"
import {User} from "../src/users/user.entity"
import {SurveyResult} from "../src/surveys/survey-result.entity"
import {SurveyResultResponseDto} from "../src/surveys/survey-result-response.dto"
import {ResponseUpdateDto} from "../src/responses/Responses"
import {Answer} from "../src/surveys/answer.entity"
import {CreateAnswerDto} from "../src/surveys/create-survey.dto"
import {SaveSurveyResultDto} from "../src/surveys/save-survey-result.dto"

describe("SurveysController: ", () => {
    let controller: SurveysController
    let surveysService: jest.Mocked<SurveysService>
    let answersService: jest.Mocked<AnswersService>
    let validationPipe: ValidationPipe

    const createMockUser = (id: number): User => ({
        id,
        name: "Test User",
        email: "test@test.ru",
        password: "password",
        surveyResults: [],
        isSelf: function(id: number): boolean {
            return this.id === id
        },
    })

    const createMockSurvey = (id: number, createdBy: number): Survey => ({
        id,
        title: "Test Survey",
        description: "Test Description",
        questions: [],
        results: [],
        createdBy,
        enabled: true,
        createdAt: new Date(),
        updatedAt: new Date(),
    })

    const currentUserId = 1
    const otherUserId = 2
    const mockCurrentUser = createMockUser(currentUserId)
    const mockSurvey = createMockSurvey(1, currentUserId)

    let mockCreateSurveyDto: CreateSurveyDto
    let mockUpdateSurveyDto: UpdateSurveyDto
    let mockUpdateSurveyStatusDto: UpdateSurveyStatusDto
    let mockCreateAnswerDto: CreateAnswerDto
    let mockSaveSurveyResultDto: SaveSurveyResultDto

    beforeEach(async () => {
        console.log("======================================================================")
        console.log(expect.getState().currentTestName)

        const mockSurveysService = {
            createSurvey: jest.fn(),
            getAllSurveys: jest.fn(),
            getSurvey: jest.fn(),
            getSurveyResult: jest.fn(),
            saveUserSurveyResult: jest.fn(),
            updateSurvey: jest.fn(),
            setSurveyActive: jest.fn(),
        }

        const mockAnswersService = {
            createAnswer: jest.fn(),
            updateAnswer: jest.fn(),
        }

        const module: TestingModule = await Test.createTestingModule({
            controllers: [SurveysController],
            providers: [
                {
                    provide: SurveysService,
                    useValue: mockSurveysService,
                },
                {
                    provide: AnswersService,
                    useValue: mockAnswersService,
                },
            ],
        }).compile()

        controller = module.get<SurveysController>(SurveysController)
        surveysService = module.get(SurveysService)
        answersService = module.get(AnswersService)
        validationPipe = new ValidationPipe({
            exceptionFactory: (errors) => {
                console.log("Ошибки валидации:", JSON.stringify(errors, null, 2))
                return new BadRequestException(errors)
            },
        })

        mockCreateSurveyDto = {
            title: "Test Survey",
            description: "Test Description",
            questions: [
                {
                    title: "Test Question 1",
                    answers: [
                        { title: "Test Answer 1" },
                        { title: "Test Answer 2" }
                    ]
                },
                {
                    title: "Test Question 2",
                    answers: [
                        { title: "Test Answer 3" },
                        { title: "Test Answer 4" }
                    ]
                }
            ]
        }

        mockUpdateSurveyDto = {
            title: "Updated Survey",
            description: "Updated Description",
            questions: [
                {
                    id: 1,
                    title: "Updated Question 1",
                    answers: [
                        { id: 1, title: "Updated Answer 1" },
                        { id: 2, title: "Updated Answer 2" }
                    ]
                },
                {
                    id: 2,
                    title: "New Question",
                    answers: [
                        { id: 3, title: "New Answer 1" },
                        { id: 4, title: "New Answer 2" }
                    ]
                }
            ]
        }

        mockUpdateSurveyStatusDto = {
            enabled: true
        }

        mockCreateAnswerDto = {
            title: "Test Answer"
        }

        mockSaveSurveyResultDto = {
            questions: [
                {
                    id: 1,
                    answers: [
                        { id: 1 }
                    ]
                }
            ]
        }
    })

    describe("создание опроса: ", () => {
        it("создать новый опрос", async () => {
            surveysService.createSurvey.mockResolvedValue(mockSurvey)
            const result = await controller.createSurvey(mockCreateSurveyDto, mockCurrentUser)
            expect(surveysService.createSurvey).toHaveBeenCalledWith(mockCreateSurveyDto, mockCurrentUser)
            expect(result).toEqual(mockSurvey)
            console.log("Ответ", result)
        })

        describe("валидация данных", () => {
            it("ошибка валидации при пустом заголовке", async () => {
                const invalidSurveyDto = { ...mockCreateSurveyDto, title: "" }
                await expect(validationPipe.transform(invalidSurveyDto, { type: "body", metatype: CreateSurveyDto }))
                    .rejects
                    .toThrow(BadRequestException)
            })

            it("ошибка валидации при пустом описании", async () => {
                const invalidSurveyDto = { ...mockCreateSurveyDto, description: "" }
                await expect(validationPipe.transform(invalidSurveyDto, { type: "body", metatype: CreateSurveyDto }))
                    .rejects
                    .toThrow(BadRequestException)
            })
        })
    })

    describe("получение опросов: ", () => {
        it("получить все опросы", async () => {
            const surveys = [mockSurvey]
            surveysService.getAllSurveys.mockResolvedValue(surveys)
            const result = await controller.getAllSurveys()
            expect(surveysService.getAllSurveys).toHaveBeenCalled()
            expect(result).toEqual(surveys)
        })

        it("получить опрос по id", async () => {
            surveysService.getSurvey.mockResolvedValue(mockSurvey)
            const result = await controller.getSurvey(mockSurvey.id)
            expect(surveysService.getSurvey).toHaveBeenCalledWith(mockSurvey.id)
            expect(result).toEqual(mockSurvey)
        })

        it("получить результаты опроса", async () => {
            const mockResults: SurveyResultResponseDto[] = []
            surveysService.getSurveyResult.mockResolvedValue(mockResults)
            const result = await controller.getSurveyResult(mockSurvey.id)
            expect(surveysService.getSurveyResult).toHaveBeenCalledWith(mockSurvey.id)
            expect(result).toEqual(mockResults)
        })
    })

    describe("обновление опроса: ", () => {
        it("обновить опрос", async () => {
            const updatedSurvey = {
                ...mockSurvey,
                title: mockUpdateSurveyDto.title,
                description: mockUpdateSurveyDto.description,
                questions: [],
            } as Survey
            surveysService.updateSurvey.mockResolvedValue(updatedSurvey)
            const result = await controller.updateSurvey(mockSurvey.id, mockUpdateSurveyDto, mockCurrentUser)
            expect(surveysService.updateSurvey).toHaveBeenCalledWith(mockUpdateSurveyDto, mockCurrentUser, mockSurvey.id)
            expect(result).toEqual(updatedSurvey)
            console.log("Ответ", result)
        })

        it("ошибка при попытке обновить чужой опрос", async () => {
            const otherUser = createMockUser(otherUserId)
            surveysService.updateSurvey.mockRejectedValue(new ForbiddenException("Нет доступа на изменение опроса."))
            try {
                await controller.updateSurvey(mockSurvey.id, mockUpdateSurveyDto, otherUser)
            } catch (error) {
                console.log("Ошибка доступа:", error.message)
                expect(error).toBeInstanceOf(ForbiddenException)
                return
            }
            fail("Ожидалось исключение ForbiddenException")
        })

        it("изменить статус опроса", async () => {
            const mockResponse: ResponseUpdateDto = { status: "success" }
            surveysService.setSurveyActive.mockResolvedValue(mockResponse)
            const result = await controller.setSurveyActive(mockSurvey.id, mockUpdateSurveyStatusDto, mockCurrentUser)
            expect(surveysService.setSurveyActive).toHaveBeenCalledWith(mockCurrentUser, mockSurvey.id, mockUpdateSurveyStatusDto.enabled)
            expect(result).toEqual(mockResponse)
            console.log("Ответ", result)
        })

        it("ошибка при попытке изменить статус чужого опроса", async () => {
            const otherUser = createMockUser(otherUserId)
            surveysService.setSurveyActive.mockRejectedValue(new ForbiddenException("Нет доступа на изменение опроса."))
            try {
                await controller.setSurveyActive(mockSurvey.id, mockUpdateSurveyStatusDto, otherUser)
            } catch (error) {
                console.log("Ошибка доступа:", error.message)
                expect(error).toBeInstanceOf(ForbiddenException)
                return
            }
            fail("Ожидалось исключение ForbiddenException")
        })
    })

    describe("работа с ответами: ", () => {
        it("создать ответ", async () => {
            const mockAnswer = {
                id: 1,
                title: mockCreateAnswerDto.title,
                question: null,
                questionId: 1,
                results: [],
                createdAt: new Date(),
                updatedAt: new Date(),
            } as Answer
            answersService.createAnswer.mockResolvedValue(mockAnswer)
            const result = await controller.createAnswer(mockSurvey.id, 1, mockCreateAnswerDto, mockCurrentUser)
            expect(answersService.createAnswer).toHaveBeenCalledWith(mockCurrentUser, mockSurvey.id, 1, mockCreateAnswerDto, true)
            expect(result).toEqual(mockAnswer)
            console.log("Ответ", result)
        })

        it("сохранить результаты опроса", async () => {
            const mockResults: SurveyResult[] = []
            surveysService.saveUserSurveyResult.mockResolvedValue(mockResults)
            const result = await controller.saveSurveyResult(mockSurvey.id, mockSaveSurveyResultDto, mockCurrentUser)
            expect(surveysService.saveUserSurveyResult).toHaveBeenCalledWith(mockCurrentUser, mockSurvey.id, mockSaveSurveyResultDto)
            expect(result).toEqual(mockResults)
            console.log("Ответ", result)
        })
    })
})
