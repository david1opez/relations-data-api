import prisma from "../../client"
import HttpException from "../models/http-exception"
import type { AuditLog } from "@prisma/client"
import type { CreateAuditLogDTO } from "../interfaces/auditlog"

class AuditLogService {
  /** Crea un nuevo registro de auditoría */
  async createAuditLog(auditLogData: CreateAuditLogDTO): Promise<AuditLog> {
    try {
      // Verificar que el usuario existe
      const user = await prisma.user.findUnique({
        where: { userID: auditLogData.userID },
      })

      if (!user) {
        throw new HttpException(404, `Usuario con ID ${auditLogData.userID} no encontrado`)
      }

      // Crear el registro de auditoría
      const auditLog = await prisma.auditLog.create({
        data: {
          action: auditLogData.action,
          description: auditLogData.description,
          userID: auditLogData.userID,
        },
      })

      return auditLog
    } catch (err) {
      if (err instanceof HttpException) {
        throw err
      }
      throw new HttpException(500, `Error al crear registro de auditoría: ${err}`)
    }
  }

  /** Obtiene todos los registros de auditoría */
  async getAllAuditLogs(): Promise<AuditLog[]> {
    try {
      const auditLogs = await prisma.auditLog.findMany({
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

      return auditLogs
    } catch (err) {
      throw new HttpException(500, `Error al obtener registros de auditoría: ${err}`)
    }
  }

  /** Obtiene los registros de auditoría de un usuario específico */
  async getAuditLogsByUser(userID: number): Promise<AuditLog[]> {
    try {
      // Verificar que el usuario existe
      const user = await prisma.user.findUnique({
        where: { userID },
      })

      if (!user) {
        throw new HttpException(404, `Usuario con ID ${userID} no encontrado`)
      }

      const auditLogs = await prisma.auditLog.findMany({
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

      return auditLogs
    } catch (err) {
      if (err instanceof HttpException) {
        throw err
      }
      throw new HttpException(500, `Error al obtener registros de auditoría del usuario: ${err}`)
    }
  }

  /** Obtiene los registros de auditoría relacionados con un proyecto específico */
  async getAuditLogsByProject(projectID: number): Promise<AuditLog[]> {
    try {
      // Verificar que el proyecto existe
      const project = await prisma.project.findUnique({
        where: { projectID },
      })

      if (!project) {
        throw new HttpException(404, `Proyecto con ID ${projectID} no encontrado`)
      }

      // Obtener los usuarios asociados al proyecto
      const userProjects = await prisma.userProject.findMany({
        where: { projectID },
        select: { userID: true },
      })

      const userIDs = userProjects.map((up) => up.userID)

      // Si no hay usuarios asociados al proyecto, devolver un array vacío
      if (userIDs.length === 0) {
        return []
      }

      // Obtener los logs de auditoría de los usuarios asociados al proyecto
      const auditLogs = await prisma.auditLog.findMany({
        where: {
          userID: {
            in: userIDs,
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

      return auditLogs
    } catch (err) {
      if (err instanceof HttpException) {
        throw err
      }
      throw new HttpException(500, `Error al obtener registros de auditoría del proyecto: ${err}`)
    }
  }
}

export default AuditLogService
