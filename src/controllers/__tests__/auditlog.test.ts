import AuditLogController from "../auditlog"
import AuditLogService from "../../services/auditlog"

jest.mock("../../services/auditlog")

describe("AuditLogController", () => {
  let auditLogController: AuditLogController
  let mockAuditLogService: jest.Mocked<AuditLogService>

  beforeEach(() => {
    mockAuditLogService = new AuditLogService() as jest.Mocked<AuditLogService>
    auditLogController = new AuditLogController()
    ;(auditLogController as any).auditLogService = mockAuditLogService
  })

  describe("createAuditLog", () => {
    it("should create and return a new audit log", async () => {
      const auditLogData = {
        action: "user.login",
        description: "User logged in",
        userID: 1,
      }

      const mockAuditLog = {
        logID: 1,
        action: "user.login",
        description: "User logged in",
        userID: 1,
        dateTime: new Date(),
      }

      mockAuditLogService.createAuditLog.mockResolvedValue(mockAuditLog)

      const result = await auditLogController.createAuditLog(auditLogData)

      expect(result).toEqual(mockAuditLog)
      expect(mockAuditLogService.createAuditLog).toHaveBeenCalledWith(auditLogData)
    })

    it("should throw error when service fails", async () => {
      const auditLogData = {
        action: "user.login",
        description: "User logged in",
        userID: 999,
      }

      mockAuditLogService.createAuditLog.mockRejectedValue(new Error("User not found"))

      await expect(auditLogController.createAuditLog(auditLogData)).rejects.toThrow("User not found")
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
        },
        {
          logID: 2,
          action: "project.created",
          description: "Project created",
          userID: 2,
          dateTime: new Date(),
        },
      ]

      mockAuditLogService.getAllAuditLogs.mockResolvedValue(mockAuditLogs)

      const result = await auditLogController.getAllAuditLogs()

      expect(result).toEqual(mockAuditLogs)
      expect(mockAuditLogService.getAllAuditLogs).toHaveBeenCalled()
    })
  })

  describe("getAuditLogsByUser", () => {
    it("should return audit logs for a specific user", async () => {
      const userID = 1
      const mockAuditLogs = [
        {
          logID: 1,
          action: "user.login",
          description: "User logged in",
          userID: 1,
          dateTime: new Date(),
        },
      ]

      mockAuditLogService.getAuditLogsByUser.mockResolvedValue(mockAuditLogs)

      const result = await auditLogController.getAuditLogsByUser(userID)

      expect(result).toEqual(mockAuditLogs)
      expect(mockAuditLogService.getAuditLogsByUser).toHaveBeenCalledWith(userID)
    })
  })

  describe("getAuditLogsByProject", () => {
    it("should return audit logs for a specific project", async () => {
      const projectID = 1
      const mockAuditLogs = [
        {
          logID: 1,
          action: "project.updated",
          description: "Project updated",
          userID: 1,
          dateTime: new Date(),
        },
      ]

      mockAuditLogService.getAuditLogsByProject.mockResolvedValue(mockAuditLogs)

      const result = await auditLogController.getAuditLogsByProject(projectID)

      expect(result).toEqual(mockAuditLogs)
      expect(mockAuditLogService.getAuditLogsByProject).toHaveBeenCalledWith(projectID)
    })
  })
})
