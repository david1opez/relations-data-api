import AuditLogService from "../auditlog"
import { prismaMock } from "../../../tests/prismaTestClient"
import HttpException from "../../models/http-exception"

describe("AuditLogService", () => {
  let auditLogService: AuditLogService

  beforeEach(() => {
    auditLogService = new AuditLogService()
  })

  describe("createAuditLog", () => {
    it("should create and return a new audit log", async () => {
      const auditLogData = {
        action: "user.login",
        description: "User logged in",
        userID: 1,
      }

      const mockUser = {
        userID: 1,
        name: "Test User",
        email: "test@example.com",
        password: null,
        role: null,
        departmentID: null,
        profilePicture: null,
      }

      const mockAuditLog = {
        logID: 1,
        action: "user.login",
        description: "User logged in",
        userID: 1,
        dateTime: new Date(),
      }

      prismaMock.user.findUnique.mockResolvedValue(mockUser)
      prismaMock.auditLog.create.mockResolvedValue(mockAuditLog)

      const result = await auditLogService.createAuditLog(auditLogData)

      expect(result).toEqual(mockAuditLog)
      expect(prismaMock.user.findUnique).toHaveBeenCalledWith({
        where: { userID: 1 },
      })
      expect(prismaMock.auditLog.create).toHaveBeenCalledWith({
        data: auditLogData,
      })
    })

    it("should throw HttpException when user not found", async () => {
      const auditLogData = {
        action: "user.login",
        description: "User logged in",
        userID: 999,
      }

      prismaMock.user.findUnique.mockResolvedValue(null)

      await expect(auditLogService.createAuditLog(auditLogData)).rejects.toThrow(HttpException)
      await expect(auditLogService.createAuditLog(auditLogData)).rejects.toMatchObject({
        errorCode: 404,
        message: "Usuario con ID 999 no encontrado",
      })
    })
  })

  describe("getAllAuditLogs", () => {
    it("should return all audit logs", async () => {
      const mockAuditLogs = [
        {
          logID: 1,
          action: "user.login",
          description: "User logged in",
          userID: 1,
          dateTime: new Date(),
          user: {
            name: "Test User",
            email: "test@example.com",
          },
        },
      ]

      prismaMock.auditLog.findMany.mockResolvedValue(mockAuditLogs)

      const result = await auditLogService.getAllAuditLogs()

      expect(result).toEqual(mockAuditLogs)
      expect(prismaMock.auditLog.findMany).toHaveBeenCalledWith({
        include: {
          user: {
            select: {
              name: true,
              email: true,
            },
          },
        },
        orderBy: {
          dateTime: "desc",
        },
      })
    })
  })

  describe("getAuditLogsByUser", () => {
    it("should return audit logs for a specific user", async () => {
      const userID = 1
      const mockUser = {
        userID: 1,
        name: "Test User",
        email: "test@example.com",
        password: null,
        role: null,
        departmentID: null,
        profilePicture: null,
      }

      const mockAuditLogs = [
        {
          logID: 1,
          action: "user.login",
          description: "User logged in",
          userID: 1,
          dateTime: new Date(),
          user: {
            name: "Test User",
            email: "test@example.com",
          },
        },
      ]

      prismaMock.user.findUnique.mockResolvedValue(mockUser)
      prismaMock.auditLog.findMany.mockResolvedValue(mockAuditLogs)

      const result = await auditLogService.getAuditLogsByUser(userID)

      expect(result).toEqual(mockAuditLogs)
      expect(prismaMock.user.findUnique).toHaveBeenCalledWith({
        where: { userID },
      })
      expect(prismaMock.auditLog.findMany).toHaveBeenCalledWith({
        where: { userID },
        include: {
          user: {
            select: {
              name: true,
              email: true,
            },
          },
        },
        orderBy: {
          dateTime: "desc",
        },
      })
    })

    it("should throw HttpException when user not found", async () => {
      const userID = 999

      prismaMock.user.findUnique.mockResolvedValue(null)

      await expect(auditLogService.getAuditLogsByUser(userID)).rejects.toThrow(HttpException)
      await expect(auditLogService.getAuditLogsByUser(userID)).rejects.toMatchObject({
        errorCode: 404,
        message: "Usuario con ID 999 no encontrado",
      })
    })
  })

  describe("getAuditLogsByProject", () => {
    it("should return audit logs for a specific project", async () => {
      const projectID = 1
      const mockProject = {
        projectID: 1,
        name: "Test Project",
        description: null,
        startDate: null,
        endDate: null,
        problemDescription: null,
        reqFuncionales: null,
        reqNoFuncionales: null,
        clientEmail: "null",
      }

      const mockUserProjects = [
        { userID: 1, projectID: 1, projectRole: null },
        { userID: 2, projectID: 1, projectRole: null },
      ]

      const mockAuditLogs = [
        {
          logID: 1,
          action: "project.updated",
          description: "Project updated",
          userID: 1,
          dateTime: new Date(),
          user: {
            name: "Test User",
            email: "test@example.com",
          },
        },
      ]

      prismaMock.project.findUnique.mockResolvedValue(mockProject)
      prismaMock.userProject.findMany.mockResolvedValue(mockUserProjects)
      prismaMock.auditLog.findMany.mockResolvedValue(mockAuditLogs)

      const result = await auditLogService.getAuditLogsByProject(projectID)

      expect(result).toEqual(mockAuditLogs)
      expect(prismaMock.project.findUnique).toHaveBeenCalledWith({
        where: { projectID },
      })
      expect(prismaMock.userProject.findMany).toHaveBeenCalledWith({
        where: { projectID },
        select: { userID: true },
      })
      expect(prismaMock.auditLog.findMany).toHaveBeenCalledWith({
        where: {
          userID: {
            in: [1, 2],
          },
        },
        include: {
          user: {
            select: {
              name: true,
              email: true,
            },
          },
        },
        orderBy: {
          dateTime: "desc",
        },
      })
    })

    it("should throw HttpException when project not found", async () => {
      const projectID = 999

      prismaMock.project.findUnique.mockResolvedValue(null)

      await expect(auditLogService.getAuditLogsByProject(projectID)).rejects.toThrow(HttpException)
      await expect(auditLogService.getAuditLogsByProject(projectID)).rejects.toMatchObject({
        errorCode: 404,
        message: "Proyecto con ID 999 no encontrado",
      })
    })

    it("should return empty array when no users are associated with the project", async () => {
      const projectID = 1
      const mockProject = {
        projectID: 1,
        name: "Test Project",
        description: null,
        startDate: null,
        endDate: null,
        problemDescription: null,
        reqFuncionales: null,
        reqNoFuncionales: null,
        clientEmail: null
      }

      prismaMock.project.findUnique.mockResolvedValue(mockProject)
      prismaMock.userProject.findMany.mockResolvedValue([])

      const result = await auditLogService.getAuditLogsByProject(projectID)

      expect(result).toEqual([])
      expect(prismaMock.auditLog.findMany).not.toHaveBeenCalled()
    })
  })
})
