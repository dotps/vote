import { Test, TestingModule } from "@nestjs/testing"
import { INestApplication, ValidationPipe } from "@nestjs/common"
import { UserController } from "./user.controller"
import { UserService } from "./user.service"
import { User } from "./user.entity"
import { UserDto } from "./user.dto"
import { AuthDto } from "../auth/auth.dto"
import { ForbiddenException, BadRequestException } from "@nestjs/common"
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

describe("UserController (интеграционный): ", () => {
  jest.setTimeout(30000)

  let app: INestApplication
  let userService: UserService
  let userRepository: Repository<User>
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

  const currentUserId = 1
  const otherUserId = 2
  const mockCurrentUser = createMockUser(currentUserId)

  const mockAuthDto = new AuthDto(mockCurrentUser, "test-token")

  let mockUserDto: UserDto

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
          envFilePath: '.env'
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
    
    const tokenService = moduleFixture.get<TokenService>(TokenService)
    userService = moduleFixture.get<UserService>(UserService)
    const reflector = moduleFixture.get('Reflector')
    
    app.useGlobalGuards(new AuthGuard(tokenService, reflector, userService))
    
    app.useGlobalPipes(
      new ValidationPipe({
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

    const uniqueEmail = `test+${Date.now()}_${Math.floor(Math.random()*10000)}@test.ru`
    mockUserDto = {
      name: "Test User",
      email: uniqueEmail,
      password: "password",
    }
  })

  describe("создание пользователя: ", () => {
    it("создать нового пользователя", async () => {
      const response = await request(app.getHttpServer())
        .post("/users")
        .send(mockUserDto)
        .expect(201)

      expect(response.body).toHaveProperty("token")
      expect(response.body.user).toMatchObject({
        name: mockUserDto.name,
        email: mockUserDto.email,
      })

      console.log("Статус создания:", response.status)
      console.log("Ответ", response.body)
    })

    describe("валидация данных", () => {
      it("ошибка валидации при пустом email", async () => {
        const invalidUserDto = { ...mockUserDto, email: "" }
        const response = await request(app.getHttpServer())
          .post("/users")
          .send(invalidUserDto)
          .expect(400)

        expect(response.body.message).toBeDefined()
      })

      it("ошибка валидации при некорректном email", async () => {
        const invalidUserDto = { ...mockUserDto, email: "email" }
        const response = await request(app.getHttpServer())
          .post("/users")
          .send(invalidUserDto)
          .expect(400)

        expect(response.body.message).toBeDefined()
      })

      it("ошибка валидации при пустом имени", async () => {
        const invalidUserDto = { ...mockUserDto, name: "" }
        const response = await request(app.getHttpServer())
          .post("/users")
          .send(invalidUserDto)
          .expect(400)

        expect(response.body.message).toBeDefined()
      })

      it("ошибка валидации при пустом пароле", async () => {
        const invalidUserDto = { ...mockUserDto, password: "" }
        const response = await request(app.getHttpServer())
          .post("/users")
          .send(invalidUserDto)
          .expect(400)

        expect(response.body.message).toBeDefined()
      })

      it("ошибка валидации пароль число", async () => {
        const invalidUserDto = { ...mockUserDto, password: 11 }
        const response = await request(app.getHttpServer())
          .post("/users")
          .send(invalidUserDto)
          .expect(400)

        expect(response.body.message).toBeDefined()
      })
    })
  })

  describe("обновление пользователя (полная перезапись всех свойств): ", () => {
    let authToken: string
    let createdUserId: number

    beforeEach(async () => {
      const response = await request(app.getHttpServer())
        .post("/users")
        .send(mockUserDto)
      authToken = response.body.token
      createdUserId = response.body.user.id
    })

    it("обновить данные пользователя", async () => {
      const response = await request(app.getHttpServer())
        .put(`/users/${createdUserId}`)
        .set("Authorization", `Bearer ${authToken}`)
        .send(mockUserDto)
        .expect(200)

      expect(response.body).toMatchObject({
        name: mockUserDto.name,
        email: mockUserDto.email,
      })

      console.log("Статус обновления:", response.status)
      console.log("Ответ", response.body)
    })

    it("ошибка обновления данных пользователя - без авторизации", async () => {
      const response = await request(app.getHttpServer())
        .put(`/users/${createdUserId}`)
        .send(mockUserDto)
        .expect(401)

      expect(response.body.statusCode).toBe(401)

      console.log("Статус", response.status)
      console.log("Ответ", response.body)
    })

    it("ошибка при попытке обновить чужой профиль", async () => {
      const otherUserDto = { ...mockUserDto, email: "other@test.ru" }
      const otherUserResponse = await request(app.getHttpServer())
        .post("/users")
        .send(otherUserDto)
      const otherUserToken = otherUserResponse.body.token

      const response = await request(app.getHttpServer())
        .put(`/users/${createdUserId}`)
        .set("Authorization", `Bearer ${otherUserToken}`)
        .send(mockUserDto)
        .expect(403)

      expect(response.body.message).toBeDefined()
      console.log("Ошибка доступа:", response.body.message)
    })

    describe("валидация данных", () => {
      it("ошибка валидации при пустом email", async () => {
        const invalidUserDto = { ...mockUserDto, email: "" }
        const response = await request(app.getHttpServer())
          .put(`/users/${createdUserId}`)
          .set("Authorization", `Bearer ${authToken}`)
          .send(invalidUserDto)
          .expect(400)

        expect(response.body.message).toBeDefined()
      })

      it("ошибка валидации при некорректном email", async () => {
        const invalidUserDto = { ...mockUserDto, email: "email" }
        const response = await request(app.getHttpServer())
          .put(`/users/${createdUserId}`)
          .set("Authorization", `Bearer ${authToken}`)
          .send(invalidUserDto)
          .expect(400)

        expect(response.body.message).toBeDefined()
      })

      it("ошибка валидации при пустом имени", async () => {
        const invalidUserDto = { ...mockUserDto, name: "" }
        const response = await request(app.getHttpServer())
          .put(`/users/${createdUserId}`)
          .set("Authorization", `Bearer ${authToken}`)
          .send(invalidUserDto)
          .expect(400)

        expect(response.body.message).toBeDefined()
      })

      it("ошибка валидации при пустом пароле", async () => {
        const invalidUserDto = { ...mockUserDto, password: "" }
        const response = await request(app.getHttpServer())
          .put(`/users/${createdUserId}`)
          .set("Authorization", `Bearer ${authToken}`)
          .send(invalidUserDto)
          .expect(400)

        expect(response.body.message).toBeDefined()
      })

      it("ошибка валидации пароль число", async () => {
        const invalidUserDto = { ...mockUserDto, password: 11 }
        const response = await request(app.getHttpServer())
          .put(`/users/${createdUserId}`)
          .set("Authorization", `Bearer ${authToken}`)
          .send(invalidUserDto)
          .expect(400)

        expect(response.body.message).toBeDefined()
      })
    })
  })

  describe("обновление пользователя (обновление только переданных свойств): ", () => {
    let authToken: string
    let createdUserId: number

    beforeEach(async () => {
      // Создаем пользователя и получаем токен для авторизации
      const response = await request(app.getHttpServer())
        .post("/users")
        .send(mockUserDto)
      authToken = response.body.token
      createdUserId = response.body.user.id
    })

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
        name: partialUpdateDto.name,
        email: mockUserDto.email, // email должен остаться прежним
      })

      console.log("Статус", response.status)
      console.log("Ответ", response.body)
    })

    it("ошибка обновления своего профиля - без авторизации", async () => {
      const partialUpdateDto = {
        name: "Updated Name",
      }

      const response = await request(app.getHttpServer())
        .patch(`/users/${createdUserId}`)
        .send(partialUpdateDto)
        .expect(401)

      expect(response.body.statusCode).toBe(401)

      console.log("Статус", response.status)
      console.log("Ответ", response.body)
    })

    it("при отсутствии email обновляется", async () => {
      const partialUpdateDto = {
        name: "Updated Name",
      }

      const response = await request(app.getHttpServer())
        .patch(`/users/${createdUserId}`)
        .set("Authorization", `Bearer ${authToken}`)
        .send(partialUpdateDto)
        .expect(200)

      expect(response.body).toMatchObject({
        name: partialUpdateDto.name,
        email: mockUserDto.email, // email должен остаться прежним
      })

      console.log("Статус", response.status)
      console.log("Ответ", response.body)
    })

    it("ошибка при попытке частично обновить чужой профиль", async () => {
      const otherUserDto = { ...mockUserDto, email: "other@test.ru" }
      const otherUserResponse = await request(app.getHttpServer())
        .post("/users")
        .send(otherUserDto)
      const otherUserToken = otherUserResponse.body.token

      const partialUpdateDto = {
        name: "Updated Name",
      }

      const response = await request(app.getHttpServer())
        .patch(`/users/${createdUserId}`)
        .set("Authorization", `Bearer ${otherUserToken}`)
        .send(partialUpdateDto)
        .expect(403)

      expect(response.body.message).toBeDefined()
      console.log("Ошибка доступа:", response.body.message)
    })

    describe("валидация данных", () => {
      it("ошибка валидации при пустом email", async () => {
        const invalidUserDto = { ...mockUserDto, email: "" }
        const response = await request(app.getHttpServer())
          .patch(`/users/${createdUserId}`)
          .set("Authorization", `Bearer ${authToken}`)
          .send(invalidUserDto)
          .expect(400)

        expect(response.body.message).toBeDefined()
      })

      it("ошибка валидации при некорректном email", async () => {
        const invalidUserDto = { ...mockUserDto, email: "email" }
        const response = await request(app.getHttpServer())
          .patch(`/users/${createdUserId}`)
          .set("Authorization", `Bearer ${authToken}`)
          .send(invalidUserDto)
          .expect(400)

        expect(response.body.message).toBeDefined()
      })

      it("ошибка валидации при пустом имени", async () => {
        const invalidUserDto = { ...mockUserDto, name: "" }
        const response = await request(app.getHttpServer())
          .patch(`/users/${createdUserId}`)
          .set("Authorization", `Bearer ${authToken}`)
          .send(invalidUserDto)
          .expect(400)

        expect(response.body.message).toBeDefined()
      })

      it("ошибка валидации при пустом пароле", async () => {
        const invalidUserDto = { ...mockUserDto, password: "" }
        const response = await request(app.getHttpServer())
          .patch(`/users/${createdUserId}`)
          .set("Authorization", `Bearer ${authToken}`)
          .send(invalidUserDto)
          .expect(400)

        expect(response.body.message).toBeDefined()
      })

      it("ошибка валидации пароль число", async () => {
        const invalidUserDto = { ...mockUserDto, password: 11 }
        const response = await request(app.getHttpServer())
          .patch(`/users/${createdUserId}`)
          .set("Authorization", `Bearer ${authToken}`)
          .send(invalidUserDto)
          .expect(400)

        expect(response.body.message).toBeDefined()
      })
    })
  })
})
