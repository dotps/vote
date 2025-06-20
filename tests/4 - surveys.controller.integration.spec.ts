import { Test, TestingModule } from "@nestjs/testing"
import { INestApplication, ValidationPipe } from "@nestjs/common"
import { TypeOrmModule } from "@nestjs/typeorm"
import { ConfigModule, ConfigService } from "@nestjs/config"
import { JwtModule } from "@nestjs/jwt"
import { AuthModule } from "../src/auth/auth.module"
import { UserModule } from "../src/users/user.module"
import { SurveysModule } from "../src/surveys/survey/surveys.module"
import { User } from "../src/users/user.entity"
import { Survey } from "../src/surveys/survey/survey.entity"
import { Question } from "../src/surveys/question/question.entity"
import { Answer } from "../src/surveys/answer/answer.entity"
import { SurveyResult } from "../src/surveys/survey/survey-result.entity"
import { AuthGuard } from "../src/auth/auth.guard"
import { TokenService } from "../src/auth/token.service"
import { UserService } from "../src/users/user.service"
import { Reflector } from "@nestjs/core"
import * as request from "supertest"
import { CreateSurveyDto } from "../src/surveys/survey/dto/create-survey.dto"
import { UpdateSurveyDto, UpdateSurveyStatusDto } from "../src/surveys/survey/dto/update-survey.dto"
import { SaveSurveyResultDto } from "../src/surveys/survey/dto/save-survey-result.dto"
import { CreateAnswerDto } from "../src/surveys/survey/dto/create-survey.dto"
import { UpdateAnswerDto } from "../src/surveys/survey/dto/update-survey.dto"
import { BadRequestException } from "@nestjs/common"
import * as jwt from "jsonwebtoken"

describe("SurveysController (интеграционный): ", () => {
  jest.setTimeout(30000)

  let app: INestApplication
  let userService: UserService
  let tokenService: TokenService
  let reflector: Reflector
  let createdUserId: number
  let authToken: string
  let createdSurveyId: number

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

  const currentUserId = 1
  const otherUserId = 2
  const mockCurrentUser = createMockUser(currentUserId)

  let mockCreateSurveyDto: CreateSurveyDto
  let mockUpdateSurveyDto: UpdateSurveyDto
  let mockUpdateSurveyStatusDto: UpdateSurveyStatusDto
  let mockCreateAnswerDto: CreateAnswerDto
  let mockSaveSurveyResultDto: SaveSurveyResultDto

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
          envFilePath: ".env",
        }),
        TypeOrmModule.forRootAsync({
          imports: [ConfigModule],
          useFactory: (configService: ConfigService) => ({
            type: "postgres",
            url: configService.get("DATABASE_URL"),
            entities: [User, SurveyResult, Survey, Question, Answer],
            synchronize: true,
          }),
          inject: [ConfigService],
        }),
        JwtModule.registerAsync({
          imports: [ConfigModule],
          useFactory: (configService: ConfigService) => ({
            secret: configService.get("JWT_SECRET"),
            signOptions: { expiresIn: "1h" },
          }),
          inject: [ConfigService],
        }),
        UserModule,
        AuthModule,
        SurveysModule,
      ],
    }).compile()

    app = moduleFixture.createNestApplication()

    tokenService = moduleFixture.get<TokenService>(TokenService)
    userService = moduleFixture.get<UserService>(UserService)
    reflector = moduleFixture.get<Reflector>(Reflector)

    app.useGlobalGuards(new AuthGuard(tokenService, reflector, userService))

    app.useGlobalPipes(
      new ValidationPipe({
        transform: true,
        whitelist: true,
        forbidNonWhitelisted: true,
        exceptionFactory: (errors) => {
          console.log("Ошибки валидации:", JSON.stringify(errors, null, 2))
          return new BadRequestException(errors)
        },
      }),
    )
    await app.init()

    const userDto = {
      name: "Test User",
      email: "test@test.ru",
      password: "password",
    }

    const response = await request(app.getHttpServer())
      .post("/users")
      .send(userDto)
      .expect(201)

    authToken = response.body.token
    const decodedToken = jwt.decode(authToken) as { sub: string }
    createdUserId = parseInt(decodedToken.sub, 10)
  })

  afterAll(async () => {
    await app.close()
  })

  beforeEach(async () => {
    console.log("======================================================================")
    console.log(expect.getState().currentTestName)

    mockCreateSurveyDto = {
      title: "Test Survey",
      description: "Test Description",
      questions: [
        {
          title: "Test Question 1",
          answers: [
            { title: "Test Answer 1" },
            { title: "Test Answer 2" },
          ],
        },
        {
          title: "Test Question 2",
          answers: [
            { title: "Test Answer 3" },
            { title: "Test Answer 4" },
          ],
        },
      ],
    }

    if (createdSurveyId) {
      const surveyResponse = await request(app.getHttpServer())
        .get(`/surveys/${createdSurveyId}`)
        .set("Authorization", `Bearer ${authToken}`)
        .expect(200)

      const survey = surveyResponse.body
      mockUpdateSurveyDto = {
        title: "Updated Survey",
        description: "Updated Description",
        questions: survey.questions.map((question: any) => ({
          id: question.id,
          title: `Updated ${question.title}`,
          answers: question.answers.map((answer: any) => ({
            id: answer.id,
            title: `Updated ${answer.title}`,
          })),
        })),
      }
    }

    mockUpdateSurveyStatusDto = {
      enabled: true,
    }

    mockCreateAnswerDto = {
      title: "Test Answer",
    }

    if (createdSurveyId) {
      const surveyResponse = await request(app.getHttpServer())
        .get(`/surveys/${createdSurveyId}`)
        .set("Authorization", `Bearer ${authToken}`)
        .expect(200)

      const survey = surveyResponse.body
      mockSaveSurveyResultDto = {
        questions: survey.questions.map((question: any) => ({
          id: question.id,
          answers: [{
            id: question.answers[0].id,
          }],
        })),
      }
    } else {
      mockSaveSurveyResultDto = {
        questions: [
          {
            id: 1,
            answers: [
              { id: 1 },
            ],
          },
        ],
      }
    }
  })

  describe("создание опроса: ", () => {
    it("создать новый опрос", async () => {
      const response = await request(app.getHttpServer())
        .post("/surveys")
        .set("Authorization", `Bearer ${authToken}`)
        .send(mockCreateSurveyDto)
        .expect(201)

      expect(response.body).toMatchObject({
        title: mockCreateSurveyDto.title,
        description: mockCreateSurveyDto.description,
        createdBy: createdUserId,
        enabled: true,
      })

      expect(response.body.questions).toHaveLength(2)
      expect(response.body.questions[0].title).toBe(mockCreateSurveyDto.questions[0].title)
      expect(response.body.questions[0].answers).toHaveLength(2)

      createdSurveyId = response.body.id

      console.log("Запрос:", mockCreateSurveyDto)
      console.log("Ответ:", response.body)
    })

    describe("валидация данных", () => {
      it("ошибка валидации при пустом заголовке", async () => {
        const invalidSurveyDto = { ...mockCreateSurveyDto, title: "" }
        const response = await request(app.getHttpServer())
          .post("/surveys")
          .set("Authorization", `Bearer ${authToken}`)
          .send(invalidSurveyDto)
          .expect(400)

        expect(response.body.message).toBeDefined()

        console.log("Запрос:", invalidSurveyDto)
        console.log("Ответ:", response.body)
      })

      it("ошибка валидации при пустом описании", async () => {
        const invalidSurveyDto = { ...mockCreateSurveyDto, description: "" }
        const response = await request(app.getHttpServer())
          .post("/surveys")
          .set("Authorization", `Bearer ${authToken}`)
          .send(invalidSurveyDto)
          .expect(400)

        expect(response.body.message).toBeDefined()

        console.log("Запрос:", invalidSurveyDto)
        console.log("Ответ:", response.body)
      })

      it("ошибка валидации при отсутствии вопросов", async () => {
        const invalidSurveyDto = { ...mockCreateSurveyDto, questions: [] }
        const response = await request(app.getHttpServer())
          .post("/surveys")
          .set("Authorization", `Bearer ${authToken}`)
          .send(invalidSurveyDto)
          .expect(400)

        expect(response.body.message).toBeDefined()

        console.log("Запрос:", invalidSurveyDto)
        console.log("Ответ:", response.body)
      })
    })
  })

  describe("получение опросов: ", () => {
    it("получить все опросы", async () => {
      const response = await request(app.getHttpServer())
        .get("/surveys")
        .set("Authorization", `Bearer ${authToken}`)
        .expect(200)

      expect(Array.isArray(response.body)).toBe(true)
      expect(response.body.length).toBeGreaterThan(0)
      expect(response.body[0]).toHaveProperty("id")
      expect(response.body[0]).toHaveProperty("title")

      console.log("Ответ:", response.body)
    })

    it("получить опрос по id", async () => {
      const response = await request(app.getHttpServer())
        .get(`/surveys/${createdSurveyId}`)
        .set("Authorization", `Bearer ${authToken}`)
        .expect(200)

      expect(response.body).toMatchObject({
        id: createdSurveyId,
        title: mockCreateSurveyDto.title,
        description: mockCreateSurveyDto.description,
      })

      console.log("Ответ:", response.body)
    })

    it("получить результаты опроса", async () => {
      await request(app.getHttpServer())
        .post(`/surveys/${createdSurveyId}`)
        .set("Authorization", `Bearer ${authToken}`)
        .send(mockSaveSurveyResultDto)
        .expect(201)

      const response = await request(app.getHttpServer())
        .get(`/surveys/${createdSurveyId}/result`)
        .set("Authorization", `Bearer ${authToken}`)
        .expect(200)

      expect(Array.isArray(response.body)).toBe(true)
      expect(response.body.length).toBeGreaterThan(0)
      expect(response.body[0]).toHaveProperty("surveyId")
      expect(response.body[0]).toHaveProperty("questionId")
      expect(response.body[0]).toHaveProperty("answerId")

      console.log("Ответ:", response.body)
    })
  })

  describe("обновление опроса: ", () => {
    it("обновить опрос", async () => {
      const response = await request(app.getHttpServer())
        .put(`/surveys/${createdSurveyId}`)
        .set("Authorization", `Bearer ${authToken}`)
        .send(mockUpdateSurveyDto)
        .expect(200)

      expect(response.body).toMatchObject({
        id: createdSurveyId,
        title: mockUpdateSurveyDto.title,
        description: mockUpdateSurveyDto.description,
      })

      console.log("Запрос:", mockUpdateSurveyDto)
      console.log("Ответ:", response.body)
    })

    it("ошибка при попытке обновить чужой опрос", async () => {
      const otherUserDto = {
        name: "Other User",
        email: "other@test.ru",
        password: "password",
      }

      const otherUserResponse = await request(app.getHttpServer())
        .post("/users")
        .send(otherUserDto)
        .expect(201)

      const otherUserToken = otherUserResponse.body.token

      const response = await request(app.getHttpServer())
        .put(`/surveys/${createdSurveyId}`)
        .set("Authorization", `Bearer ${otherUserToken}`)
        .send(mockUpdateSurveyDto)
        .expect(403)

      expect(response.body.message).toBeDefined()

      console.log("Запрос:", mockUpdateSurveyDto)
      console.log("Ответ:", response.body)
    })

    it("изменить статус опроса", async () => {
      const response = await request(app.getHttpServer())
        .patch(`/surveys/${createdSurveyId}/status`)
        .set("Authorization", `Bearer ${authToken}`)
        .send(mockUpdateSurveyStatusDto)
        .expect(200)

      expect(response.body).toMatchObject({
        status: "success",
      })

      console.log("Запрос:", mockUpdateSurveyStatusDto)
      console.log("Ответ:", response.body)
    })
  })

  describe("работа с ответами: ", () => {
    let questionId: number
    let answerId: number

    beforeEach(async () => {
      if (createdSurveyId) {
        const surveyResponse = await request(app.getHttpServer())
          .get(`/surveys/${createdSurveyId}`)
          .set("Authorization", `Bearer ${authToken}`)
          .expect(200)

        const survey = surveyResponse.body
        questionId = survey.questions[0].id
        answerId = survey.questions[0].answers[0].id
      }
    })

    it("создать ответ", async () => {
      const response = await request(app.getHttpServer())
        .post(`/surveys/${createdSurveyId}/questions/${questionId}/answers`)
        .set("Authorization", `Bearer ${authToken}`)
        .send(mockCreateAnswerDto)
        .expect(201)

      expect(response.body).toMatchObject({
        title: mockCreateAnswerDto.title,
        questionId: questionId,
      })

      console.log("Запрос:", mockCreateAnswerDto)
      console.log("Ответ:", response.body)
    })

    it("обновить ответ", async () => {
      const updateAnswerDto: UpdateAnswerDto = {
        id: answerId,
        title: "Updated Answer",
      }

      const response = await request(app.getHttpServer())
        .patch(`/surveys/${createdSurveyId}/answers/${answerId}`)
        .set("Authorization", `Bearer ${authToken}`)
        .send(updateAnswerDto)
        .expect(200)

      expect(response.body).toMatchObject({
        id: answerId,
        title: updateAnswerDto.title,
      })

      console.log("Запрос:", updateAnswerDto)
      console.log("Ответ:", response.body)
    })
  })

  describe("ошибка соединения с БД: ", () => {
    let originalDatabaseUrl: string
    let brokenApp: INestApplication

    beforeAll(() => {
      originalDatabaseUrl = process.env.DATABASE_URL
      process.env.DATABASE_URL = "postgresql://wrong_user:wrong_password@localhost:5432/wrong_db"
    })

    afterAll(async () => {
      process.env.DATABASE_URL = originalDatabaseUrl
      if (brokenApp) {
        await brokenApp.close()
      }
    })

    it("должен вернуть ошибку при получении всех опросов, если БД недоступна", async () => {
      let error
      let timeoutId: NodeJS.Timeout
      const timeoutPromise = new Promise((_, reject) => {
        timeoutId = setTimeout(() => reject(new Error("Timeout")), 30000)
      })
      try {
        const moduleFixture: TestingModule = await Test.createTestingModule({
          imports: [
            ConfigModule.forRoot({
              isGlobal: true,
              envFilePath: ".env",
            }),
            TypeOrmModule.forRootAsync({
              imports: [ConfigModule],
              useFactory: (configService: ConfigService) => ({
                type: "postgres",
                url: configService.get("DATABASE_URL"),
                entities: [User, SurveyResult, Survey, Question, Answer],
                synchronize: true,
              }),
              inject: [ConfigService],
            }),
            JwtModule.registerAsync({
              imports: [ConfigModule],
              useFactory: (configService: ConfigService) => ({
                secret: configService.get("JWT_SECRET"),
                signOptions: { expiresIn: "1h" },
              }),
              inject: [ConfigService],
            }),
            UserModule,
            AuthModule,
            SurveysModule,
          ],
        }).compile()
        brokenApp = moduleFixture.createNestApplication()
        await Promise.race([brokenApp.init(), timeoutPromise])
        await request(brokenApp.getHttpServer())
          .get("/surveys")
          .expect(500)
      } catch (e) {
        error = e
      } finally {
        clearTimeout(timeoutId)
      }
      expect(error).toBeDefined()
    })
  })
})
