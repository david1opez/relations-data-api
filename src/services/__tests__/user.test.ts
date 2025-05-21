import UserService from "../user"
import { prismaMock } from "../../../tests/prismaTestClient"
import { expect, describe, beforeEach, afterEach, test } from "@jest/globals"

describe("UserService", () => {
  let userService: UserService

  beforeEach(() => {
    userService = new UserService()
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  test("should return user if login is successful", async () => {
    const mockUser = { userID: 1, password: "secret" }
    ;(prismaMock.user.findUnique as jest.Mock).mockResolvedValue(mockUser)

    const result = await userService.checkLogin(1, "secret")

    expect(result).toEqual(mockUser)
    expect(prismaMock.user.findUnique).toHaveBeenCalledWith({ where: { userID: 1 } })
  })

  test("should throw HttpException with errorCode 404 when user is not found", async () => {
    ;(prismaMock.user.findUnique as jest.Mock).mockResolvedValue(null)

    await expect(userService.checkLogin(2, "anypass")).rejects.toMatchObject({
      errorCode: 404,
      message: "User not found",
    })
  })

  test("should throw HttpException with errorCode 401 for invalid password", async () => {
    const mockUser = { userID: 1, password: "secret" }
    ;(prismaMock.user.findUnique as jest.Mock).mockResolvedValue(mockUser)

    await expect(userService.checkLogin(1, "wrongpass")).rejects.toMatchObject({
      errorCode: 401,
      message: "Invalid password",
    })
  })

  test("should throw HttpException with errorCode 500 when prisma.findUnique fails", async () => {
    const errorMsg = "database error"
    ;(prismaMock.user.findUnique as jest.Mock).mockRejectedValue(new Error(errorMsg))

    await expect(userService.checkLogin(1, "secret")).rejects.toThrow(`Error checking login: Error: ${errorMsg}`)
  })

  // Tests for getUser
  test("should return user with department when getUser is successful", async () => {
    const mockUser = {
      userID: 1,
      name: "Test User",
      email: "test@example.com",
      department: { departmentID: 1, name: "IT" },
    }
    ;(prismaMock.user.findUnique as jest.Mock).mockResolvedValue(mockUser)

    const result = await userService.getUser(1)

    expect(result).toEqual(mockUser)
    expect(prismaMock.user.findUnique).toHaveBeenCalledWith({
      where: { userID: 1 },
      include: { department: true },
    })
  })

  test("should throw HttpException with errorCode 404 when user is not found in getUser", async () => {
    ;(prismaMock.user.findUnique as jest.Mock).mockResolvedValue(null)

    await expect(userService.getUser(999)).rejects.toMatchObject({
      errorCode: 404,
      message: "User not found",
    })
  })

  // Tests for getAllUsers
  test("should return all users with departments", async () => {
    const mockUsers = [
      { userID: 1, name: "User 1", email: "user1@example.com", department: { departmentID: 1, name: "IT" } },
      { userID: 2, name: "User 2", email: "user2@example.com", department: null },
    ]
    ;(prismaMock.user.findMany as jest.Mock).mockResolvedValue(mockUsers)

    const result = await userService.getAllUsers()

    expect(result).toEqual(mockUsers)
    expect(prismaMock.user.findMany).toHaveBeenCalledWith({ include: { department: true } })
  })

  // Tests for createUser
  test("should create and return a new user", async () => {
    const userData = {
      name: "New User",
      email: "new@example.com",
      password: "password123",
      role: "User",
      departmentID: 1,
    }
    const mockCreatedUser = { userID: 3, ...userData }
    ;(prismaMock.user.findUnique as jest.Mock).mockResolvedValue(null)
    ;(prismaMock.user.create as jest.Mock).mockResolvedValue(mockCreatedUser)

    const result = await userService.createUser(userData)

    expect(result).toEqual(mockCreatedUser)
    expect(prismaMock.user.create).toHaveBeenCalledWith({ data: userData })
  })

  test("should throw HttpException with errorCode 409 when email already exists", async () => {
    const userData = { name: "New User", email: "existing@example.com" }
    const existingUser = { userID: 2, name: "Existing User", email: "existing@example.com" }
    ;(prismaMock.user.findUnique as jest.Mock).mockResolvedValue(existingUser)

    await expect(userService.createUser(userData)).rejects.toMatchObject({
      errorCode: 409,
      message: "User with this email already exists",
    })
  })

  // Tests for deleteUser
  test("should delete a user and return success message", async () => {
    const mockUser = { userID: 1, name: "Test User", email: "test@example.com" }
    ;(prismaMock.user.findUnique as jest.Mock).mockResolvedValue(mockUser)
    ;(prismaMock.user.delete as jest.Mock).mockResolvedValue(mockUser)

    const result = await userService.deleteUser(1)

    expect(result).toEqual({ success: true, message: "User deleted successfully" })
    expect(prismaMock.user.delete).toHaveBeenCalledWith({ where: { userID: 1 } })
  })

  test("should throw HttpException with errorCode 404 when user to delete is not found", async () => {
    ;(prismaMock.user.findUnique as jest.Mock).mockResolvedValue(null)

    await expect(userService.deleteUser(999)).rejects.toMatchObject({
      errorCode: 404,
      message: "User not found",
    })
  })

  describe("updateUserProjects", () => {
    const mockUser = {
      userID: 1,
      name: "Test User",
      email: "test@example.com",
      password: null,
      role: null,
      departmentID: null
    }
    const mockProjects = [
      { projectID: 1, projectRole: "Developer" },
      { projectID: 2, projectRole: "Manager" }
    ]

    beforeEach(() => {
      prismaMock.user.findUnique.mockResolvedValue(mockUser)
      prismaMock.userProject.findMany.mockResolvedValue([])
      prismaMock.userProject.deleteMany.mockResolvedValue({ count: 0 })
      prismaMock.userProject.upsert.mockResolvedValue({
        userID: 1,
        projectID: 1,
        projectRole: "Developer"
      })
    })

    test("should update user projects successfully", async () => {
      const result = await userService.updateUserProjects({
        userID: 1,
        projects: mockProjects
      })

      expect(prismaMock.user.findUnique).toHaveBeenCalledWith({
        where: { userID: 1 }
      })
      expect(prismaMock.userProject.findMany).toHaveBeenCalledWith({
        where: { userID: 1 }
      })
      expect(result).toBeDefined()
    })

    test("should throw 404 when user not found", async () => {
      prismaMock.user.findUnique.mockResolvedValue(null)

      await expect(userService.updateUserProjects({
        userID: 999,
        projects: mockProjects
      })).rejects.toMatchObject({
        errorCode: 404,
        message: "User not found"
      })
    })

    test("should delete existing assignments not in new list", async () => {
      const existingAssignments = [
        { userID: 1, projectID: 3, projectRole: "Developer" }
      ]
      prismaMock.userProject.findMany.mockResolvedValue(existingAssignments)
      
      await userService.updateUserProjects({
        userID: 1,
        projects: mockProjects
      })

      expect(prismaMock.userProject.deleteMany).toHaveBeenCalledWith({
        where: {
          AND: [
            { userID: 1 },
            { projectID: { in: [3] } }
          ]
        }
      })
    })
  })
})
