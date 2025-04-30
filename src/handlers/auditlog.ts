import type { Request, Response, NextFunction } from "express"
import AuditLogController from "../controllers/auditlog"
import HttpException from "../models/http-exception"
import type { CreateAuditLogDTO } from "../interfaces/auditlog"

class AuditLogHandler {
  private auditLogController: AuditLogController

  constructor() {
    this.auditLogController = new AuditLogController()
  }

  public async createAuditLog(req: Request, res: Response, next: NextFunction) {
    try {
      const { action, description, userID } = req.body

      if (!action || !userID) {
        throw new HttpException(400, "Se requieren los campos 'action' y 'userID'")
      }

      const userIDInt = Number.parseInt(userID.toString(), 10)
      if (isNaN(userIDInt)) {
        throw new HttpException(400, "El ID de usuario debe ser un número")
      }

      const auditLogData: CreateAuditLogDTO = {
        action,
        description,
        userID: userIDInt,
      }

      const auditLog = await this.auditLogController.createAuditLog(auditLogData)
      res.status(201).json(auditLog)
    } catch (err) {
      next(err)
    }
  }

  public async getAllAuditLogs(req: Request, res: Response, next: NextFunction) {
    try {
      const auditLogs = await this.auditLogController.getAllAuditLogs()
      res.status(200).json(auditLogs)
    } catch (err) {
      next(err)
    }
  }

  public async getAuditLogsByUser(req: Request, res: Response, next: NextFunction) {
    try {
      const { userID } = req.params

      if (!userID) {
        throw new HttpException(400, "Se requiere el ID de usuario")
      }

      const userIDInt = Number.parseInt(userID, 10)
      if (isNaN(userIDInt)) {
        throw new HttpException(400, "El ID de usuario debe ser un número")
      }

      const auditLogs = await this.auditLogController.getAuditLogsByUser(userIDInt)
      res.status(200).json(auditLogs)
    } catch (err) {
      next(err)
    }
  }

  public async getAuditLogsByProject(req: Request, res: Response, next: NextFunction) {
    try {
      const { projectID } = req.params

      if (!projectID) {
        throw new HttpException(400, "Se requiere el ID del proyecto")
      }

      const projectIDInt = Number.parseInt(projectID, 10)
      if (isNaN(projectIDInt)) {
        throw new HttpException(400, "El ID del proyecto debe ser un número")
      }

      const auditLogs = await this.auditLogController.getAuditLogsByProject(projectIDInt)
      res.status(200).json(auditLogs)
    } catch (err) {
      next(err)
    }
  }
}

export default AuditLogHandler
