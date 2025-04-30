import AuditLogService from "../services/auditlog"
import type { AuditLog } from "@prisma/client"
import type { CreateAuditLogDTO } from "../interfaces/auditlog"

class AuditLogController {
  private auditLogService: AuditLogService

  constructor() {
    this.auditLogService = new AuditLogService()
  }

  async createAuditLog(auditLogData: CreateAuditLogDTO): Promise<AuditLog> {
    return this.auditLogService.createAuditLog(auditLogData)
  }

  async getAllAuditLogs(): Promise<AuditLog[]> {
    return this.auditLogService.getAllAuditLogs()
  }

  async getAuditLogsByUser(userID: number): Promise<AuditLog[]> {
    return this.auditLogService.getAuditLogsByUser(userID)
  }

  async getAuditLogsByProject(projectID: number): Promise<AuditLog[]> {
    return this.auditLogService.getAuditLogsByProject(projectID)
  }
}

export default AuditLogController
