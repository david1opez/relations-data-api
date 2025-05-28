import UserController from "../user"
import UserService from "../../services/user"

jest.mock("../../services/user")

describe("UserController", () => {
  let userController: UserController
  let mockUserService: jest.Mocked<UserService>

  beforeEach(() => {
    mockUserService = new UserService() as jest.Mocked<UserService>
    userController = new UserController()
    ;(userController as any).userService = mockUserService // Inject mocked service
  })

  describe("checkLogin", () => {
    it("should return user data when login is successful", async () => {
      const mockUser = {
        userID: 1,
        name: "Test User",
        email: "test@example.com",
        password: null,
        role: null,
        departmentID: null,
      }
      mockUserService.checkLogin.mockResolvedValue(mockUser)

      const result = await userController.checkLogin(1, "password123")

      expect(result).toEqual(mockUser)
      expect(mockUserService.checkLogin).toHaveBeenCalledWith(1, "password123")
    })

    it("should throw an error when user is not found", async () => {
      mockUserService.checkLogin.mockRejectedValue(new Error("User not found"))

      await expect(userController.checkLogin(999, "password123")).rejects.toThrow(
        "Error checking login: Error: User not found",
      )
    })

    it("should throw an error when password is invalid", async () => {
      mockUserService.checkLogin.mockRejectedValue(new Error("Invalid password"))

      await expect(userController.checkLogin(1, "wrongpassword")).rejects.toThrow(
        "Error checking login: Error: Invalid password",
      )
    })

    it("should throw an error when service fails", async () => {
      mockUserService.checkLogin.mockRejectedValue(new Error("Service error"))

      await expect(userController.checkLogin(1, "password123")).rejects.toThrow(
        "Error checking login: Error: Service error",
      )
    })
  })

  describe("getUser", () => {
    it("should return user data when fetch is successful", async () => {
      const mockUser = {
        userID: 1,
        name: "Test User",
        email: "test@example.com",
        password: null,
        role: null,
        departmentID: null,
        department: null,
      }
      mockUserService.getUser.mockResolvedValue(mockUser)

      const result = await userController.getUser(1)

      expect(result).toEqual(mockUser)
      expect(mockUserService.getUser).toHaveBeenCalledWith(1)
    })

    it("should throw an error when user is not found", async () => {
      mockUserService.getUser.mockRejectedValue(new Error("User not found"))

      await expect(userController.getUser(999)).rejects.toThrow("Error fetching user: Error: User not found")
    })
  })

  describe("getAllUsers", () => {
    it("should return all users when fetch is successful", async () => {
      const mockUsers = [
        {
          userID: 1,
          name: "User 1",
          email: "user1@example.com",
          role: null,
          departmentID: null,
          department: null,
          password: null,
        },
        {
          userID: 2,
          name: "User 2",
          email: "user2@example.com",
          role: null,
          departmentID: null,
          department: null,
          password: null,
        },
      ]
      mockUserService.getAllUsers.mockResolvedValue(mockUsers)

      const result = await userController.getAllUsers()

      expect(result).toEqual(mockUsers)
      expect(mockUserService.getAllUsers).toHaveBeenCalled()
    })

    it("should throw an error when service fails", async () => {
      mockUserService.getAllUsers.mockRejectedValue(new Error("Service error"))

      await expect(userController.getAllUsers()).rejects.toThrow("Error fetching users: Error: Service error")
    })
  })

  describe("createUser", () => {
    it("should return created user data when creation is successful", async () => {
      const userData = {
        name: "New User",
        email: "new@example.com",
        password: "password123",
        role: "User",
        departmentID: 1,
      }
      const mockCreatedUser = { userID: 3, ...userData }
      mockUserService.createUser.mockResolvedValue(mockCreatedUser)

      const result = await userController.createUser(userData)

      expect(result).toEqual(mockCreatedUser)
      expect(mockUserService.createUser).toHaveBeenCalledWith(userData)
    })

    it("should throw an error when email already exists", async () => {
      const userData = {
        name: "New User",
        email: "existing@example.com",
      }
      mockUserService.createUser.mockRejectedValue(new Error("User with this email already exists"))

      await expect(userController.createUser(userData)).rejects.toThrow(
        "Error creating user: Error: User with this email already exists",
      )
    })
  })

  describe("deleteUser", () => {
    it("should return success message when deletion is successful", async () => {
      const mockResult = { success: true, message: "User deleted successfully" }
      mockUserService.deleteUser.mockResolvedValue(mockResult)

      const result = await userController.deleteUser(1)

      expect(result).toEqual(mockResult)
      expect(mockUserService.deleteUser).toHaveBeenCalledWith(1)
    })

    it("should throw an error when user to delete is not found", async () => {
      mockUserService.deleteUser.mockRejectedValue(new Error("User not found"))

      await expect(userController.deleteUser(999)).rejects.toThrow("Error deleting user: Error: User not found")
    })
  })

  describe("updateUserProjects", () => {
    const mockProjects = [
      { projectID: 1, projectRole: "Developer" },
      { projectID: 2, projectRole: "Manager" }
    ]

    it("should return updated project assignments when successful", async () => {
      const mockResult = [
        {
          userID: 1,
          projectID: 1,
          projectRole: "Developer",
          project: {
            projectID: 1,
            name: "Project 1",
            description: null,
            startDate: null,
            endDate: null,
            problemDescription: null,
            reqFuncionales: null,
            reqNoFuncionales: null,
            clientEmail: null,
          }
        }
      ]
      mockUserService.updateUserProjects.mockResolvedValue(mockResult)

      const result = await userController.updateUserProjects({
        userID: 1,
        projects: mockProjects
      })

      expect(result).toEqual(mockResult)
      expect(mockUserService.updateUserProjects).toHaveBeenCalledWith({
        userID: 1,
        projects: mockProjects
      })
    })

    it("should throw an error when service fails", async () => {
      const error = new Error("Service error")
      mockUserService.updateUserProjects.mockRejectedValue(error)

      await expect(userController.updateUserProjects({
        userID: 1,
        projects: mockProjects
      })).rejects.toThrow("Error updating user projects: Error: Service error")
    })
  })
})
