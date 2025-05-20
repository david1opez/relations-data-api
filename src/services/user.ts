import prisma from "../../client"
import HttpException from "../models/http-exception"
import type { UpdateUserDTO } from "../interfaces/user"

class UserService {
  async checkLogin(userID: number, password: string) {
    try {
      const user = await prisma.user.findUnique({
        where: { userID: userID },
      })
      if (!user) {
        throw new HttpException(404, "User not found")
      }
      if (user.password !== password) {
        throw new HttpException(401, "Invalid password")
      }
      return user
    } catch (err) {
      if (err instanceof HttpException) {
        throw err
      }
      throw new Error(`Error checking login: ${err}`)
    }
  }

  async getUser(userID: number) {
    try {
      const user = await prisma.user.findUnique({
        where: { userID: userID },
        include: {
          department: true,
        },
      })
      if (!user) {
        throw new HttpException(404, "User not found")
      }
      return user
    } catch (err) {
      if (err instanceof HttpException) {
        throw err
      }
      throw new HttpException(500, "Error fetching user: " + err)
    }
  }

  async getAllUsers() {
    try {
      const users = await prisma.user.findMany({
        include: {
          department: true,
        },
      })
      return users
    } catch (err) {
      if (err instanceof HttpException) {
        throw err
      }
      throw new HttpException(500, "Error fetching users: " + err)
    }
  }

  async createUser(userData: { name: string; email: string; password?: string; role?: string; departmentID?: number }) {
    try {
      // Check if user with email already exists
      const existingUser = await prisma.user.findUnique({
        where: { email: userData.email },
      })
      if (existingUser) {
        throw new HttpException(409, "User with this email already exists")
      }

      const user = await prisma.user.create({
        data: userData,
      })
      return user
    } catch (err) {
      if (err instanceof HttpException) {
        throw err
      }
      throw new HttpException(500, "Error creating user: " + err)
    }
  }

  async updateUser(userID: number, userData: UpdateUserDTO) {
    try {
      // Check if user exists
      const existingUser = await prisma.user.findUnique({
        where: { userID: userID },
      })

      if (!existingUser) {
        throw new HttpException(404, "User not found")
      }

      // If email is being updated, check if it's already in use by another user
      if (userData.email && userData.email !== existingUser.email) {
        const userWithEmail = await prisma.user.findUnique({
          where: { email: userData.email },
        })

        if (userWithEmail && userWithEmail.userID !== userID) {
          throw new HttpException(409, "Email is already in use by another user")
        }
      }

      // Update user
      const updatedUser = await prisma.user.update({
        where: { userID: userID },
        data: userData,
        include: {
          department: true,
        },
      })

      return updatedUser
    } catch (err) {
      if (err instanceof HttpException) {
        throw err
      }
      throw new HttpException(500, "Error updating user: " + err)
    }
  }

  async deleteUser(userID: number) {
    try {
      console.log(`Intentando eliminar usuario con ID: ${userID}`)
  
      // 1. Verificar si el usuario existe
      const user = await prisma.user.findUnique({
        where: { userID: userID },
      })
      
      if (!user) {
        console.log(`Usuario con ID ${userID} no encontrado`)
        throw new HttpException(404, "User not found")
      }
      
      console.log(`Usuario encontrado: ${user.name} (${user.email})`)
  
      // 2. Verificar si el usuario tiene proyectos asignados
      const userProjects = await prisma.userProject.findMany({
        where: { userID: userID },
      })
      
      if (userProjects.length > 0) {
        console.log(`El usuario tiene ${userProjects.length} proyectos asignados. Eliminando asignaciones...`)
        
        // 3. Eliminar las asignaciones de proyectos primero
        await prisma.userProject.deleteMany({
          where: { userID: userID },
        })
        
        console.log("Asignaciones de proyectos eliminadas correctamente")
      } else {
        console.log("El usuario no tiene proyectos asignados")
      }
  
      // 4. Verificar si el usuario tiene registros de auditoría
      const auditLogs = await prisma.auditLog.findMany({
        where: { userID: userID },
      })
      
      if (auditLogs.length > 0) {
        console.log(`El usuario tiene ${auditLogs.length} registros de auditoría. Eliminando registros...`)
        
        // 5. Eliminar los registros de auditoría
        await prisma.auditLog.deleteMany({
          where: { userID: userID },
        })
        
        console.log("Registros de auditoría eliminados correctamente")
      } else {
        console.log("El usuario no tiene registros de auditoría")
      }
  
      // 6. Eliminar el usuario
      console.log(`Eliminando usuario ${userID}...`)
      await prisma.user.delete({
        where: { userID: userID },
      })
      
      console.log(`Usuario ${userID} eliminado correctamente`)
      
      return { success: true, message: "User deleted successfully" }
    } catch (err) {
      console.error(`Error al eliminar usuario ${userID}:`, err)
      
      if (err instanceof HttpException) {
        throw err
      }
      
      // Manejar errores específicos de Prisma
      if ((err as any).code === "P2025") {
        throw new HttpException(404, "User not found")
      }
      
      if ((err as any).code === "P2003") {
        throw new HttpException(400, "Cannot delete user because it is referenced by other records")
      }
      
      throw new HttpException(500, `Error deleting user: ${err instanceof Error ? err.message : String(err)}`)
    }
  }
}
export default UserService;