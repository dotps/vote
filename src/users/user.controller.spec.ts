import {Test, TestingModule} from "@nestjs/testing"
import {UserController} from "./user.controller"
import {UserService} from "./user.service"
import {User} from "./user.entity"
import {UserDto} from "./user.dto"
import {AuthDto} from "../auth/auth.dto"
import {ForbiddenException} from "@nestjs/common"

describe("UserController", () => {
    let controller: UserController
    let userService: jest.Mocked<UserService>

    const createMockUser = (id: number): User => ({
        id,
        name: "Test User",
        email: "test@test.ru",
        password: "password",
        surveyResults: [],
        isSelf: function(id: number): boolean {
            return this.id === id
        }
    })

    const currentUserId = 1
    const otherUserId = 2
    const mockUser = createMockUser(currentUserId)

    const mockAuthDto = new AuthDto(mockUser, "test-token")

    const mockUserDto: UserDto = {
        name: "Test User",
        email: "test@test.ru",
        password: "password"
    }

    beforeEach(async () => {
        const mockUserService = {
            createUser: jest.fn(),
            updateUser: jest.fn(),
        }

        const module: TestingModule = await Test.createTestingModule({
            controllers: [UserController],
            providers: [
                {
                    provide: UserService,
                    useValue: mockUserService
                }
            ]
        }).compile()

        controller = module.get<UserController>(UserController)
        userService = module.get(UserService)
    })

    // TODO: продолжить создание теста

    describe("создание пользователя", () => {
        it("создать нового пользователя", async () => {
            userService.createUser.mockResolvedValue(mockAuthDto)

            const result = await controller.create(mockUserDto)

            expect(userService.createUser).toHaveBeenCalledWith(mockUserDto)
            expect(result).toEqual(mockAuthDto)
        })

        it("ошибка валидации при создании нового пользователя", async () => {
            userService.createUser.mockResolvedValue(mockAuthDto)

            const result = await controller.create(mockUserDto)

            expect(userService.createUser).toHaveBeenCalledWith(mockUserDto)
            expect(result).toEqual(mockAuthDto)
        })
    })

    describe("обновление пользователя (полная перезапись всех свойств)", () => {
        it("обновить данные пользователя", async () => {
            userService.updateUser.mockResolvedValue(mockUser)

            const result = await controller.update(currentUserId, mockUserDto, mockUser)

            expect(userService.updateUser).toHaveBeenCalledWith(currentUserId, mockUserDto)
            expect(result).toEqual(mockUser)
        })

        it("ошибка при попытке обновить чужой профиль", async () => {
            const otherUser = createMockUser(otherUserId)

            await expect(controller.update(currentUserId, mockUserDto, otherUser))
                .rejects
                .toThrow(ForbiddenException)
        })
    })

    describe("обновление пользователя (обновление только переданных свойств)", () => {
        it("пользователь обновляет свой профиль", async () => {
            const partialUpdateDto: Partial<UserDto> = {
                name: "Updated Name"
            }
            const updatedUser = {
                ...createMockUser(currentUserId),
                name: "Updated Name"
            } as User
            userService.updateUser.mockResolvedValue(updatedUser)

            const result = await controller.partialUpdate(currentUserId, partialUpdateDto as UserDto, mockUser)

            expect(userService.updateUser).toHaveBeenCalledWith(currentUserId, partialUpdateDto)
            expect(result).toEqual(updatedUser)
        })

        it("ошибка при попытке частично обновить чужой профиль", async () => {
            const otherUser = createMockUser(otherUserId)
            const partialUpdateDto: Partial<UserDto> = {
                name: "Updated Name"
            }

            await expect(controller.partialUpdate(currentUserId, partialUpdateDto as UserDto, otherUser))
                .rejects
                .toThrow(ForbiddenException)
        })
    })
})
