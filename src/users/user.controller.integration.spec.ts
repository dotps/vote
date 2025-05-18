import { Test, TestingModule } from "@nestjs/testing"
import { INestApplication, ValidationPipe } from "@nestjs/common"
import { UserService } from "./user.service"
import { User } from "./user.entity"
import { UserDto } from "./user.dto"
import { AuthDto } from "../auth/auth.dto"
import { BadRequestException } from "@nestjs/common"
import * as request from "supertest"
import { TypeOrmModule } from "@nestjs/typeorm"
import { ConfigModule, ConfigService } from "@nestjs/config"
import { JwtModule } from "@nestjs/jwt"
import { AuthModule } from "../auth/auth.module"
import { UserModule } from "./user.module"
import { Repository } from "typeorm"
import { SurveyResult } from "../surveys/survey-result.entity"
import { Survey } from "../surveys/survey.entity"
import { Question } from "../surveys/question.entity"
import { Answer } from "../surveys/answer.entity"
import { AuthGuard } from "../auth/auth.guard"
import { TokenService } from "../auth/token.service"
import * as jwt from "jsonwebtoken"
import { Reflector } from "@nestjs/core"

describe("UserController (интеграционный): ", () => {
  jest.setTimeout(30000)

  let app: INestApplication
  let userService: UserService
  let userRepository: Repository<User>
  let validationPipe: ValidationPipe
  let tokenService: TokenService
  let reflector: Reflector
  let createdUserId: number
  let authToken: string

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

  const mockAuthDto = new AuthDto(mockCurrentUser, "test-token")

  let mockUserDto: UserDto
  let updateUserDto: UserDto

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

    userRepository = moduleFixture.get<Repository<User>>("UserRepository")
  })

  afterAll(async () => {
    await app.close()
  })

  beforeEach(async () => {
    console.log("======================================================================")
    console.log(expect.getState().currentTestName)

    const random = (Math.floor(Math.random() * 10000)).toString()
    mockUserDto = {
      name: `Test User ${random}`,
      email: `${random}@test.ru`,
      password: random,
    }

    updateUserDto = {
      ...mockUserDto,
      name: `Update User ${random}`,
    }
  })

  describe("создание пользователя: ", () => {
    it("создать пользователя", async () => {
      const response = await request(app.getHttpServer())
        .post("/users")
        .send(mockUserDto)
        .expect(201)

      expect(response.body).toHaveProperty("token")
      expect(response.body.token).toBeDefined()

      const decodedToken = jwt.decode(response.body.token) as { sub: string }
      createdUserId = parseInt(decodedToken.sub, 10)
      authToken = response.body.token

      console.log("Запрос:", mockUserDto)
      console.log("Ответ:", response.body)
    })

    describe("валидация данных", () => {
      it("ошибка валидации при пустом email", async () => {
        const invalidUserDto = { ...mockUserDto, email: "" }
        const response = await request(app.getHttpServer())
          .post("/users")
          .send(invalidUserDto)
          .expect(400)

        expect(response.body.message).toBeDefined()

        console.log("Запрос:", invalidUserDto)
        console.log("Ответ:", response.body)
      })

      it("ошибка валидации при некорректном email", async () => {
        const invalidUserDto = { ...mockUserDto, email: "email" }
        const response = await request(app.getHttpServer())
          .post("/users")
          .send(invalidUserDto)
          .expect(400)

        expect(response.body.message).toBeDefined()

        console.log("Запрос:", invalidUserDto)
        console.log("Ответ:", response.body)
      })

      it("ошибка валидации при пустом имени", async () => {
        const invalidUserDto = { ...mockUserDto, name: "" }
        const response = await request(app.getHttpServer())
          .post("/users")
          .send(invalidUserDto)
          .expect(400)

        expect(response.body.message).toBeDefined()

        console.log("Запрос:", invalidUserDto)
        console.log("Ответ:", response.body)
      })

      it("ошибка валидации при пустом пароле", async () => {
        const invalidUserDto = { ...mockUserDto, password: "" }
        const response = await request(app.getHttpServer())
          .post("/users")
          .send(invalidUserDto)
          .expect(400)

        expect(response.body.message).toBeDefined()

        console.log("Запрос:", invalidUserDto)
        console.log("Ответ:", response.body)
      })

      it("ошибка валидации пароль число", async () => {
        const invalidUserDto = { ...mockUserDto, password: 11 }
        const response = await request(app.getHttpServer())
          .post("/users")
          .send(invalidUserDto)
          .expect(400)

        expect(response.body.message).toBeDefined()

        console.log("Запрос:", invalidUserDto)
        console.log("Ответ:", response.body)
      })
    })
  })

  describe("обновление пользователя (полная перезапись всех свойств): ", () => {
    it("обновить данные пользователя", async () => {

      const response = await request(app.getHttpServer())
        .put(`/users/${createdUserId}`)
        .set("Authorization", `Bearer ${authToken}`)
        .send(updateUserDto)
        .expect(200)

      expect(response.body).toMatchObject({
        id: createdUserId,
        name: updateUserDto.name,
        email: updateUserDto.email,
      })

      console.log("createdUserId:", createdUserId)
      console.log("Запрос:", updateUserDto)
      console.log("Ответ:", response.body)
    })

    it("ошибка обновления данных пользователя - без авторизации", async () => {
      const response = await request(app.getHttpServer())
        .put(`/users/${createdUserId}`)
        .send(updateUserDto)
        .expect(401)

      console.log("Запрос:", updateUserDto)
      console.log("Ответ:", response.body)
    })

    it("ошибка при попытке обновить чужой профиль", async () => {
      const otherUserDto = { ...mockUserDto, email: "other@test.ru" }
      const createdOtherUserResponse = await request(app.getHttpServer())
        .post("/users")
        .send(otherUserDto)

      const otherUser = createdOtherUserResponse.body

      const response = await request(app.getHttpServer())
        .put(`/users/${createdUserId}`)
        .set("Authorization", `Bearer ${otherUser.token}`)
        .send(updateUserDto)
        .expect(403)

      expect(response.body.message).toBeDefined()

      console.log("Запрос: otherUser", otherUser)
      console.log("Запрос: mockUserDto", updateUserDto)
      console.log("Ответ:", response.body)
    })

    describe("валидация данных", () => {
      it("ошибка валидации при пустом email", async () => {
        const invalidUserDto = { ...updateUserDto, email: "" }
        const response = await request(app.getHttpServer())
          .put(`/users/${createdUserId}`)
          .set("Authorization", `Bearer ${authToken}`)
          .send(invalidUserDto)
          .expect(400)

        expect(response.body.message).toBeDefined()

        console.log("Запрос:", invalidUserDto)
        console.log("Ответ:", response.body)
      })

      it("ошибка валидации при некорректном email", async () => {
        const invalidUserDto = { ...updateUserDto, email: "email" }
        const response = await request(app.getHttpServer())
          .put(`/users/${createdUserId}`)
          .set("Authorization", `Bearer ${authToken}`)
          .send(invalidUserDto)
          .expect(400)

        expect(response.body.message).toBeDefined()

        console.log("Запрос:", invalidUserDto)
        console.log("Ответ:", response.body)
      })

      it("ошибка валидации при пустом имени", async () => {
        const invalidUserDto = { ...updateUserDto, name: "" }
        const response = await request(app.getHttpServer())
          .put(`/users/${createdUserId}`)
          .set("Authorization", `Bearer ${authToken}`)
          .send(invalidUserDto)
          .expect(400)

        expect(response.body.message).toBeDefined()

        console.log("Запрос:", invalidUserDto)
        console.log("Ответ:", response.body)
      })

      it("ошибка валидации при пустом пароле", async () => {
        const invalidUserDto = { ...updateUserDto, password: "" }
        const response = await request(app.getHttpServer())
          .put(`/users/${createdUserId}`)
          .set("Authorization", `Bearer ${authToken}`)
          .send(invalidUserDto)
          .expect(400)

        expect(response.body.message).toBeDefined()

        console.log("Запрос:", invalidUserDto)
        console.log("Ответ:", response.body)
      })

      it("ошибка валидации пароль число", async () => {
        const invalidUserDto = { ...updateUserDto, password: 11 }
        const response = await request(app.getHttpServer())
          .put(`/users/${createdUserId}`)
          .set("Authorization", `Bearer ${authToken}`)
          .send(invalidUserDto)
          .expect(400)

        expect(response.body.message).toBeDefined()

        console.log("Запрос:", invalidUserDto)
        console.log("Ответ:", response.body)
      })
    })
  })

  describe("обновление пользователя (обновление только переданных свойств): ", () => {
    it("пользователь обновляет свой профиль", async () => {
      const partialUpdateDto = {
        name: "Updated Name",
      }

      const response = await request(app.getHttpServer())
        .patch(`/users/${createdUserId}`)
        .set("Authorization", `Bearer ${authToken}`)
        .send(partialUpdateDto)
        .expect(200)

      expect(response.body).toMatchObject({
        id: createdUserId,
        name: partialUpdateDto.name,
      })

      console.log("Запрос:", partialUpdateDto)
      console.log("Ответ:", response.body)
    })

    it("ошибка обновления своего профиля - без авторизации", async () => {
      const partialUpdateDto = {
        name: "Updated Name",
      }

      const response = await request(app.getHttpServer())
        .patch(`/users/${createdUserId}`)
        .send(partialUpdateDto)
        .expect(401)

      console.log("Запрос:", partialUpdateDto)
      console.log("Ответ:", response.body)
    })

    it("при отсутствии email - обновляется", async () => {
      const partialUpdateDto = {
        name: "Updated Name",
        password: mockUserDto.password,
      }

      const response = await request(app.getHttpServer())
        .patch(`/users/${createdUserId}`)
        .set("Authorization", `Bearer ${authToken}`)
        .send(partialUpdateDto)
        .expect(200)

      expect(response.body).toMatchObject({
        id: createdUserId,
        name: partialUpdateDto.name,
        password: partialUpdateDto.password,
      })

      console.log("Запрос:", partialUpdateDto)
      console.log("Ответ:", response.body)
    })

    describe("валидация данных", () => {
      it("ошибка валидации при некорректном email", async () => {
        const invalidUserDto = { email: "email" }
        const response = await request(app.getHttpServer())
          .patch(`/users/${createdUserId}`)
          .set("Authorization", `Bearer ${authToken}`)
          .send(invalidUserDto)
          .expect(400)

        expect(response.body.message).toBeDefined()

        console.log("Запрос:", invalidUserDto)
        console.log("Ответ:", response.body)
      })

      it("ошибка валидации пароль число", async () => {
        const invalidUserDto = { password: 11 }
        const response = await request(app.getHttpServer())
          .patch(`/users/${createdUserId}`)
          .set("Authorization", `Bearer ${authToken}`)
          .send(invalidUserDto)
          .expect(400)

        expect(response.body.message).toBeDefined()

        console.log("Запрос:", invalidUserDto)
        console.log("Ответ:", response.body)
      })
    })
  })
})
