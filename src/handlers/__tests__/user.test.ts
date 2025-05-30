import UserHandler from "../user"
import UserController from "../../controllers/user"
import HttpException from "../../models/http-exception"
import type { Request, Response } from "express"
import { User } from "@prisma/client"
import path from "path"
import fs from "fs"
import { Readable } from 'stream'

// Import or define AuthenticatedRequest
interface AuthenticatedRequest extends Request {
  user?: {
    userID: number;
    name: string;
    [key: string]: any;
  };
}

jest.mock("../../controllers/user")

describe("UserHandler", () => {
  let userHandler: UserHandler
  let mockRequest: Partial<AuthenticatedRequest>
  let mockResponse: Partial<Response>
  let nextFunction: jest.Mock

  beforeEach(() => {
    userHandler = new UserHandler()
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    }
    nextFunction = jest.fn()
  })

  describe("checkLogin", () => {
    it("should return 400 when userID or password is missing", async () => {
      mockRequest = {
        body: { userID: "", password: "" },
      }

      await userHandler.checkLogin(mockRequest as Request, mockResponse as Response, nextFunction)

      expect(nextFunction).toHaveBeenCalledWith(expect.any(HttpException))
    })

    it("should return 400 when userID is not a number", async () => {
      mockRequest = {
        body: { userID: "abc", password: "secret" },
      }

      await userHandler.checkLogin(mockRequest as Request, mockResponse as Response, nextFunction)

      expect(nextFunction).toHaveBeenCalledWith(expect.any(HttpException))
    })

    it("should return 400 when password is empty", async () => {
      mockRequest = {
        body: { userID: "123", password: "" },
      }

      await userHandler.checkLogin(mockRequest as Request, mockResponse as Response, nextFunction)

      expect(nextFunction).toHaveBeenCalledWith(expect.any(HttpException))
    })

    it("should return 200 and user data when login is successful", async () => {
      const mockUser = { id: 123, name: "Test User" }
      ;(UserController.prototype.checkLogin as jest.Mock).mockResolvedValue(mockUser)

      mockRequest = {
        body: { userID: "123", password: "secret" },
      }

      await userHandler.checkLogin(mockRequest as Request, mockResponse as Response, nextFunction)

      expect(mockResponse.status).toHaveBeenCalledWith(200)
      expect(mockResponse.json).toHaveBeenCalledWith(mockUser)
    })

    it("should call next with error if controller throws", async () => {
      const mockError = new Error("Internal Error")
      ;(UserController.prototype.checkLogin as jest.Mock).mockRejectedValue(mockError)

      mockRequest = {
        body: { userID: "123", password: "secret" },
      }

      await userHandler.checkLogin(mockRequest as Request, mockResponse as Response, nextFunction)

      expect(nextFunction).toHaveBeenCalledWith(mockError)
    })
  })

  describe("getUser", () => {
    it("should return 400 when userID is missing", async () => {
      mockRequest = {
        params: {},
      }

      await userHandler.getUser(mockRequest as Request, mockResponse as Response, nextFunction)

      expect(nextFunction).toHaveBeenCalledWith(expect.any(HttpException))
    })

    it("should return 400 when userID is not a number", async () => {
      mockRequest = {
        params: { userID: "abc" },
      }

      await userHandler.getUser(mockRequest as Request, mockResponse as Response, nextFunction)

      expect(nextFunction).toHaveBeenCalledWith(expect.any(HttpException))
    })

    it("should return 200 and user data when fetch is successful", async () => {
      const mockUser = { userID: 123, name: "Test User", email: "test@example.com" }
      ;(UserController.prototype.getUser as jest.Mock).mockResolvedValue(mockUser)

      mockRequest = {
        params: { userID: "123" },
      }

      await userHandler.getUser(mockRequest as Request, mockResponse as Response, nextFunction)

      expect(mockResponse.status).toHaveBeenCalledWith(200)
      expect(mockResponse.json).toHaveBeenCalledWith(mockUser)
    })
  })

  describe("getAllUsers", () => {
    it("should return 200 and users data when fetch is successful", async () => {
      const mockUsers = [
        { userID: 1, name: "User 1", email: "user1@example.com" },
        { userID: 2, name: "User 2", email: "user2@example.com" },
      ]
      ;(UserController.prototype.getAllUsers as jest.Mock).mockResolvedValue(mockUsers)

      mockRequest = {}

      await userHandler.getAllUsers(mockRequest as Request, mockResponse as Response, nextFunction)

      expect(mockResponse.status).toHaveBeenCalledWith(200)
      expect(mockResponse.json).toHaveBeenCalledWith(mockUsers)
    })

    it("should call next with error if controller throws", async () => {
      const mockError = new Error("Internal Error")
      ;(UserController.prototype.getAllUsers as jest.Mock).mockRejectedValue(mockError)

      mockRequest = {}

      await userHandler.getAllUsers(mockRequest as Request, mockResponse as Response, nextFunction)

      expect(nextFunction).toHaveBeenCalledWith(mockError)
    })
  })

  describe("createUser", () => {
    it("should return 400 when name or email is missing", async () => {
      mockRequest = {
        body: { name: "", email: "" },
      }

      await userHandler.createUser(mockRequest as Request, mockResponse as Response, nextFunction)

      expect(nextFunction).toHaveBeenCalledWith(expect.any(HttpException))
    })

    it("should return 400 when email format is invalid", async () => {
      mockRequest = {
        body: { name: "Test User", email: "invalid-email" },
      }

      await userHandler.createUser(mockRequest as Request, mockResponse as Response, nextFunction)

      expect(nextFunction).toHaveBeenCalledWith(expect.any(HttpException))
    })

    it("should return 400 when departmentID is not a number", async () => {
      mockRequest = {
        body: { name: "Test User", email: "test@example.com", departmentID: "abc" },
      }

      await userHandler.createUser(mockRequest as Request, mockResponse as Response, nextFunction)

      expect(nextFunction).toHaveBeenCalledWith(expect.any(HttpException))
    })

    it("should return 201 and user data when creation is successful", async () => {
      const mockUser = { userID: 123, name: "Test User", email: "test@example.com" }
      ;(UserController.prototype.createUser as jest.Mock).mockResolvedValue(mockUser)

      mockRequest = {
        body: { name: "Test User", email: "test@example.com" },
      }

      await userHandler.createUser(mockRequest as Request, mockResponse as Response, nextFunction)

      expect(mockResponse.status).toHaveBeenCalledWith(201)
      expect(mockResponse.json).toHaveBeenCalledWith(mockUser)
    })
  })

  describe("deleteUser", () => {
    it("should return 400 when userID is missing", async () => {
      mockRequest = {
        params: {},
      }

      await userHandler.deleteUser(mockRequest as Request, mockResponse as Response, nextFunction)

      expect(nextFunction).toHaveBeenCalledWith(expect.any(HttpException))
    })

    it("should return 400 when userID is not a number", async () => {
      mockRequest = {
        params: { userID: "abc" },
      }

      await userHandler.deleteUser(mockRequest as Request, mockResponse as Response, nextFunction)

      expect(nextFunction).toHaveBeenCalledWith(expect.any(HttpException))
    })

    it("should return 200 and success message when deletion is successful", async () => {
      const mockResult = { success: true, message: "User deleted successfully" }
      ;(UserController.prototype.deleteUser as jest.Mock).mockResolvedValue(mockResult)

      mockRequest = {
        params: { userID: "123" },
      }

      await userHandler.deleteUser(mockRequest as Request, mockResponse as Response, nextFunction)

      expect(mockResponse.status).toHaveBeenCalledWith(200)
      expect(mockResponse.json).toHaveBeenCalledWith(mockResult)
    })
  })

  describe("updateUserProjects", () => {
    it("should return 400 when userID is missing", async () => {
      mockRequest = {
        body: { projects: [] }
      }

      await userHandler.updateUserProjects(
        mockRequest as Request,
        mockResponse as Response,
        nextFunction
      )

      expect(nextFunction).toHaveBeenCalledWith(
        expect.objectContaining({
          errorCode: 400,
          message: "User ID and projects array are required"
        })
      )
    })

    it("should return 400 when projects array is missing", async () => {
      mockRequest = {
        body: { userID: 1 }
      }

      await userHandler.updateUserProjects(
        mockRequest as Request,
        mockResponse as Response,
        nextFunction
      )

      expect(nextFunction).toHaveBeenCalledWith(
        expect.objectContaining({
          errorCode: 400,
          message: "User ID and projects array are required"
        })
      )
    })

    it("should return 400 when userID is not a number", async () => {
      mockRequest = {
        body: { userID: "abc", projects: [] }
      }

      await userHandler.updateUserProjects(
        mockRequest as Request,
        mockResponse as Response,
        nextFunction
      )

      expect(nextFunction).toHaveBeenCalledWith(
        expect.objectContaining({
          errorCode: 400,
          message: "User ID must be a number"
        })
      )
    })

    it("should return 400 when projectID is missing in a project", async () => {
      mockRequest = {
        body: {
          userID: 1,
          projects: [{ projectRole: "Developer" }]
        }
      }

      await userHandler.updateUserProjects(
        mockRequest as Request,
        mockResponse as Response,
        nextFunction
      )

      expect(nextFunction).toHaveBeenCalledWith(
        expect.objectContaining({
          errorCode: 400,
          message: "Each project must have a valid projectID"
        })
      )
    })

    it("should return 200 and updated projects when successful", async () => {
      const mockProjects = [
        { projectID: 1, projectRole: "Developer" },
        { projectID: 2, projectRole: "Manager" }
      ]
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
            clientEmail: null
          }
        }
      ]

      jest.spyOn(userHandler['userController'], 'updateUserProjects')
        .mockResolvedValue(mockResult)

      mockRequest = {
        body: {
          userID: 1,
          projects: mockProjects
        }
      }

      await userHandler.updateUserProjects(
        mockRequest as Request,
        mockResponse as Response,
        nextFunction
      )

      expect(mockResponse.status).toHaveBeenCalledWith(200)
      expect(mockResponse.json).toHaveBeenCalledWith(mockResult)
    })

    it("should call next with error if controller throws", async () => {
      const mockError = new Error("Internal Error")
      jest.spyOn(userHandler['userController'], 'updateUserProjects')
        .mockRejectedValue(mockError)

      mockRequest = {
        body: {
          userID: 1,
          projects: [{ projectID: 1 }]
        }
      }

      await userHandler.updateUserProjects(
        mockRequest as Request,
        mockResponse as Response,
        nextFunction
      )

      expect(nextFunction).toHaveBeenCalledWith(mockError)
    })
  })

  describe("uploadProfilePicture", () => {
    const testImagePath = path.join(__dirname, "../../../tests/RoadMap.png")
    
    it("should upload profile picture successfully", async () => {
      // Crear un mock del archivo
      const mockFile = {
        fieldname: 'image',
        originalname: 'RoadMap.png',
        encoding: '7bit',
        mimetype: 'image/png',
        destination: 'uploads/profile-pictures',
        filename: 'profile-123456789.png',
        path: 'uploads/profile-pictures/profile-123456789.png',
        size: fs.statSync(testImagePath).size,
        stream: new Readable(),
        buffer: Buffer.from([])
      }

      // Mock del request con el archivo y usuario autenticado
      mockRequest = {
        file: mockFile,
        user: {
          userID: 1,
          name: "Test User"
        },
        headers: {
          'content-type': 'multipart/form-data',
        }
      }

      // Mock de la respuesta del controlador
      const mockUpdatedUser = {
        userID: 1,
        name: "Test User",
        email: "test@example.com",
        password: "password123",
        role: "user",
        departmentID: null,
        profilePicture: "http://localhost:3001/uploads/profile-pictures/profile-123456789.png",
        createdAt: new Date(),
        updatedAt: new Date()
      }

      jest.spyOn(userHandler["userController"], "uploadProfilePicture")
        .mockResolvedValue(mockUpdatedUser)

      await userHandler.uploadProfilePicture(mockRequest as AuthenticatedRequest, mockResponse as Response, nextFunction)

      expect(mockResponse.status).toHaveBeenCalledWith(200)
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: "Profile picture updated successfully",
        user: mockUpdatedUser
      })
    })

    it("should handle unauthorized request", async () => {
      mockRequest = {
        file: {
          fieldname: 'image',
          originalname: 'test.png',
          encoding: '7bit',
          mimetype: 'image/png',
          destination: 'uploads/profile-pictures',
          filename: 'test.png',
          path: 'uploads/profile-pictures/test.png',
          size: 1024,
          stream: new Readable(),
          buffer: Buffer.from([])
        },
        headers: {
          'content-type': 'multipart/form-data',
        },
        user: undefined // Usuario no autenticado
      }

      await userHandler.uploadProfilePicture(mockRequest as AuthenticatedRequest, mockResponse as Response, nextFunction)

      expect(nextFunction).toHaveBeenCalledWith(
        expect.objectContaining({
          message: "Unauthorized - Please log in"
        })
      )
    })

    it("should handle missing file", async () => {
      mockRequest = {
        file: undefined,
        headers: {
          'content-type': 'multipart/form-data',
        },
        user: {
          userID: 1,
          name: "Test User"
        }
      }

      await userHandler.uploadProfilePicture(mockRequest as AuthenticatedRequest, mockResponse as Response, nextFunction)

      expect(nextFunction).toHaveBeenCalledWith(
        expect.objectContaining({
          message: "No file uploaded"
        })
      )
    })
  })
})
