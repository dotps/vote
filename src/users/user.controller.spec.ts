import { Test, TestingModule } from "@nestjs/testing"
import { UserController } from "./user.controller"
import { UserService } from "./user.service"
import { User } from "./user.entity"
import { UserDto } from "./user.dto"
import { AuthDto } from "../auth/auth.dto"
import { ForbiddenException, ValidationPipe, BadRequestException } from "@nestjs/common"
import { ValidationGroup } from "../validation/ValidationGroup"
import { APP_PIPE } from "@nestjs/core"

describe("UserController: ", () => {
  let controller: UserController
  let userService: jest.Mocked<UserService>
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

  let mockUserDto: UserDto = {
    name: "Test User",
    email: "test@test.ru",
    password: "password",
  }

  beforeEach(async () => {
    console.log("======================================================================")
    console.log(expect.getState().currentTestName)

    const mockUserService = {
      createUser: jest.fn(),
      updateUser: jest.fn(),
    }

    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [
        {
          provide: UserService,
          useValue: mockUserService,
        },
        ValidationPipe,
      ],
    }).compile()

    controller = module.get<UserController>(UserController)
    userService = module.get(UserService)
    // validationPipe = new ValidationPipe()
    validationPipe = new ValidationPipe({
      exceptionFactory: (errors) => {
        console.log("Ошибки валидации:", JSON.stringify(errors, null, 2))
        return new BadRequestException(errors)
      },
    })
  })

  describe("создание пользователя: ", () => {
    it("создать нового пользователя", async () => {
      userService.createUser.mockResolvedValue(mockAuthDto)
      const result = await controller.create(mockUserDto)
      expect(userService.createUser).toHaveBeenCalledWith(mockUserDto)
      expect(result).toEqual(mockAuthDto)
      console.log("Ответ", result)
    })

    describe("валидация данных", () => {
      it("ошибка валидации при пустом email", async () => {
        const invalidUserDto = { ...mockUserDto, email: "" }
        await expect(validationPipe.transform(invalidUserDto, { type: "body", metatype: UserDto }))
          .rejects
          .toThrow(BadRequestException)
      })

      it("ошибка валидации при некорректном email", async () => {
        const invalidUserDto = { ...mockUserDto, email: "email" }
        await expect(validationPipe.transform(invalidUserDto, { type: "body", metatype: UserDto }))
          .rejects
          .toThrow(BadRequestException)
      })

      it("ошибка валидации при пустом имени", async () => {
        const invalidUserDto = { ...mockUserDto, name: "" }
        await expect(validationPipe.transform(invalidUserDto, { type: "body", metatype: UserDto }))
          .rejects
          .toThrow(BadRequestException)
      })

      it("ошибка валидации при пустом пароле", async () => {
        const invalidUserDto = { ...mockUserDto, password: "" }
        await expect(validationPipe.transform(invalidUserDto, { type: "body", metatype: UserDto }))
          .rejects
          .toThrow(BadRequestException)
      })

      it("ошибка валидации пароль число", async () => {
        const invalidUserDto = { ...mockUserDto, password: 11 }
        await expect(validationPipe.transform(invalidUserDto, { type: "body", metatype: UserDto }))
          .rejects
          .toThrow(BadRequestException)
      })
    })
  })

  describe("обновление пользователя (полная перезапись всех свойств): ", () => {
    it("обновить данные пользователя", async () => {
      userService.updateUser.mockResolvedValue(mockCurrentUser)
      const result = await controller.update(currentUserId, mockUserDto, mockCurrentUser)
      expect(userService.updateUser).toHaveBeenCalledWith(currentUserId, mockUserDto)
      expect(result).toEqual(mockCurrentUser)
      console.log("Ответ", result)
    })

    it("ошибка при попытке обновить чужой профиль", async () => {
      const otherUser = createMockUser(otherUserId)
      try {
        await controller.update(currentUserId, mockUserDto, otherUser)
      } catch (error) {
        console.log("Ошибка доступа:", error.message)
        expect(error).toBeInstanceOf(ForbiddenException)
        return
      }
      fail("Ожидалось исключение ForbiddenException")
    })

    describe("валидация данных", () => {
      it("ошибка валидации при пустом email", async () => {
        const invalidUserDto = { ...mockUserDto, email: "" }
        await expect(validationPipe.transform(invalidUserDto, { type: "body", metatype: UserDto }))
          .rejects
          .toThrow(BadRequestException)
      })

      it("ошибка валидации при некорректном email", async () => {
        const invalidUserDto = { ...mockUserDto, email: "email" }
        await expect(validationPipe.transform(invalidUserDto, { type: "body", metatype: UserDto }))
          .rejects
          .toThrow(BadRequestException)
      })

      it("ошибка валидации при пустом имени", async () => {
        const invalidUserDto = { ...mockUserDto, name: "" }
        await expect(validationPipe.transform(invalidUserDto, { type: "body", metatype: UserDto }))
          .rejects
          .toThrow(BadRequestException)
      })

      it("ошибка валидации при пустом пароле", async () => {
        const invalidUserDto = { ...mockUserDto, password: "" }
        await expect(validationPipe.transform(invalidUserDto, { type: "body", metatype: UserDto }))
          .rejects
          .toThrow(BadRequestException)
      })

      it("ошибка валидации пароль число", async () => {
        const invalidUserDto = { ...mockUserDto, password: 11 }
        await expect(validationPipe.transform(invalidUserDto, { type: "body", metatype: UserDto }))
          .rejects
          .toThrow(BadRequestException)
      })
    })
  })

  describe("обновление пользователя (обновление только переданных свойств): ", () => {
    it("пользователь обновляет свой профиль", async () => {
      const partialUpdateDto: Partial<UserDto> = {
        name: "Updated Name",
      }
      const updatedUser = {
        ...createMockUser(currentUserId),
        name: "Updated Name",
      } as User
      userService.updateUser.mockResolvedValue(updatedUser)

      const result = await controller.partialUpdate(currentUserId, partialUpdateDto as UserDto, mockCurrentUser)

      expect(userService.updateUser).toHaveBeenCalledWith(currentUserId, partialUpdateDto)
      expect(result).toEqual(updatedUser)
      console.log("Ответ", result)
    })

    it("при отсутствии email обновляется", async () => {
      const partialUpdateDto: Partial<UserDto> = {
        name: "Updated Name",
        email: undefined
      }
      const updatedUser = {
        ...createMockUser(currentUserId),
        name: "Updated Name"
      } as User
      userService.updateUser.mockResolvedValue(updatedUser)

      const result = await controller.partialUpdate(currentUserId, partialUpdateDto as UserDto, mockCurrentUser)

      expect(userService.updateUser).toHaveBeenCalledWith(currentUserId, partialUpdateDto)
      expect(result).toEqual(updatedUser)
      console.log("Ответ при обновлении без email:", result)
    })

    it("ошибка при попытке частично обновить чужой профиль", async () => {
      const otherUser = createMockUser(otherUserId)
      const partialUpdateDto: Partial<UserDto> = {
        name: "Updated Name",
      }
      try {
        await controller.partialUpdate(currentUserId, partialUpdateDto as UserDto, otherUser)
      } catch (error) {
        console.log("Ошибка доступа:", error.message)
        expect(error).toBeInstanceOf(ForbiddenException)
        return
      }
      fail("Ожидалось исключение ForbiddenException")
    })

    describe("валидация данных", () => {
      it("ошибка валидации при пустом email", async () => {
        const invalidUserDto = { ...mockUserDto, email: "" }
        await expect(validationPipe.transform(invalidUserDto, { type: "body", metatype: UserDto }))
          .rejects
          .toThrow(BadRequestException)
      })

      it("ошибка валидации при некорректном email", async () => {
        const invalidUserDto = { ...mockUserDto, email: "email" }
        await expect(validationPipe.transform(invalidUserDto, { type: "body", metatype: UserDto }))
          .rejects
          .toThrow(BadRequestException)
      })

      it("ошибка валидации при пустом имени", async () => {
        const invalidUserDto = { ...mockUserDto, name: "" }
        await expect(validationPipe.transform(invalidUserDto, { type: "body", metatype: UserDto }))
          .rejects
          .toThrow(BadRequestException)
      })

      it("ошибка валидации при пустом пароле", async () => {
        const invalidUserDto = { ...mockUserDto, password: "" }
        await expect(validationPipe.transform(invalidUserDto, { type: "body", metatype: UserDto }))
          .rejects
          .toThrow(BadRequestException)
      })

      it("ошибка валидации пароль число", async () => {
        const invalidUserDto = { ...mockUserDto, password: 11 }
        await expect(validationPipe.transform(invalidUserDto, { type: "body", metatype: UserDto }))
          .rejects
          .toThrow(BadRequestException)
      })
    })
  })
})
