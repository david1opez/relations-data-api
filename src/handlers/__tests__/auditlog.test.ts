import AuditLogHandler from "../auditlog"
import type { Request, Response } from "express"
import HttpException from "../../models/http-exception"

describe("AuditLogHandler", () => {
  let auditLogHandler: AuditLogHandler
  let mockRequest: Partial<Request>
  let mockResponse: Partial<Response>
  let nextFunction: jest.Mock

  beforeEach(() => {
    auditLogHandler = new AuditLogHandler()
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    }
    nextFunction = jest.fn()
  })

  describe("createAuditLog", () => {
    it("should return 400 when action or userID is missing", async () => {
      mockRequest = {
        body: { description: "Test description" },
      }

      await auditLogHandler.createAuditLog(mockRequest as Request, mockResponse as Response, nextFunction)

      expect(nextFunction).toHaveBeenCalledWith(expect.any(HttpException))
      const error = nextFunction.mock.calls[0][0] as HttpException
      expect(error.errorCode).toBe(400)
    })

    it("should return 400 when userID is not a number", async () => {
      mockRequest = {
        body: { action: "test.action", userID: "abc" },
      }

      await auditLogHandler.createAuditLog(mockRequest as Request, mockResponse as Response, nextFunction)

      expect(nextFunction).toHaveBeenCalledWith(expect.any(HttpException))
      const error = nextFunction.mock.calls[0][0] as HttpException
      expect(error.errorCode).toBe(400)
    })

    it("should return 201 and created audit log when successful", async () => {
      const mockAuditLog = {
        logID: 1,
        action: "test.action",
        description: "Test description",
        userID: 1,
        dateTime: new Date(),
      }

      mockRequest = {
        body: { action: "test.action", description: "Test description", userID: 1 },
      }

      jest.spyOn(auditLogHandler["auditLogController"], "createAuditLog").mockResolvedValue(mockAuditLog)

      await auditLogHandler.createAuditLog(mockRequest as Request, mockResponse as Response, nextFunction)

      expect(mockResponse.status).toHaveBeenCalledWith(201)
      expect(mockResponse.json).toHaveBeenCalledWith(mockAuditLog)
    })
  })

  describe("getAllAuditLogs", () => {
    it("should return 200 with all audit logs when successful", async () => {
      const mockAuditLogs = [
        {
          logID: 1,
          action: "test.action",
          description: "Test description",
          userID: 1,
          dateTime: new Date(),
        },
      ]

      jest.spyOn(auditLogHandler["auditLogController"], "getAllAuditLogs").mockResolvedValue(mockAuditLogs)

      await auditLogHandler.getAllAuditLogs(mockRequest as Request, mockResponse as Response, nextFunction)

      expect(mockResponse.status).toHaveBeenCalledWith(200)
      expect(mockResponse.json).toHaveBeenCalledWith(mockAuditLogs)
    })
  })

  describe("getAuditLogsByUser", () => {
    it("should return 400 when userID is missing", async () => {
      mockRequest = {
        params: {},
      }

      await auditLogHandler.getAuditLogsByUser(mockRequest as Request, mockResponse as Response, nextFunction)

      expect(nextFunction).toHaveBeenCalledWith(expect.any(HttpException))
      const error = nextFunction.mock.calls[0][0] as HttpException
      expect(error.errorCode).toBe(400)
    })

    it("should return 400 when userID is not a number", async () => {
      mockRequest = {
        params: { userID: "abc" },
      }

      await auditLogHandler.getAuditLogsByUser(mockRequest as Request, mockResponse as Response, nextFunction)

      expect(nextFunction).toHaveBeenCalledWith(expect.any(HttpException))
      const error = nextFunction.mock.calls[0][0] as HttpException
      expect(error.errorCode).toBe(400)
    })

    it("should return 200 with user audit logs when successful", async () => {
      const mockAuditLogs = [
        {
          logID: 1,
          action: "test.action",
          description: "Test description",
          userID: 1,
          dateTime: new Date(),
        },
      ]

      mockRequest = {
        params: { userID: "1" },
      }

      jest.spyOn(auditLogHandler["auditLogController"], "getAuditLogsByUser").mockResolvedValue(mockAuditLogs)

      await auditLogHandler.getAuditLogsByUser(mockRequest as Request, mockResponse as Response, nextFunction)

      expect(mockResponse.status).toHaveBeenCalledWith(200)
      expect(mockResponse.json).toHaveBeenCalledWith(mockAuditLogs)
    })
  })

  describe("getAuditLogsByProject", () => {
    it("should return 400 when projectID is missing", async () => {
      mockRequest = {
        params: {},
      }

      await auditLogHandler.getAuditLogsByProject(mockRequest as Request, mockResponse as Response, nextFunction)

      expect(nextFunction).toHaveBeenCalledWith(expect.any(HttpException))
      const error = nextFunction.mock.calls[0][0] as HttpException
      expect(error.errorCode).toBe(400)
    })

    it("should return 400 when projectID is not a number", async () => {
      mockRequest = {
        params: { projectID: "abc" },
      }

      await auditLogHandler.getAuditLogsByProject(mockRequest as Request, mockResponse as Response, nextFunction)

      expect(nextFunction).toHaveBeenCalledWith(expect.any(HttpException))
      const error = nextFunction.mock.calls[0][0] as HttpException
      expect(error.errorCode).toBe(400)
    })

    it("should return 200 with project audit logs when successful", async () => {
      const mockAuditLogs = [
        {
          logID: 1,
          action: "test.action",
          description: "Test description",
          userID: 1,
          dateTime: new Date(),
        },
      ]

      mockRequest = {
        params: { projectID: "1" },
      }

      jest.spyOn(auditLogHandler["auditLogController"], "getAuditLogsByProject").mockResolvedValue(mockAuditLogs)

      await auditLogHandler.getAuditLogsByProject(mockRequest as Request, mockResponse as Response, nextFunction)

      expect(mockResponse.status).toHaveBeenCalledWith(200)
      expect(mockResponse.json).toHaveBeenCalledWith(mockAuditLogs)
    })
  })
})
