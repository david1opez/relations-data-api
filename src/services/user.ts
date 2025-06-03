import prisma from "../../client"
import HttpException from "../models/http-exception"
import type { UpdateUserDTO, UpdateUserProjectsDTO, ProjectAssignment } from "../interfaces/user"
import { User } from "@prisma/client"

class UserService {
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
      const user = await prisma.user.findUnique({
        where: { userID: userID },
      })
      
      if (!user) {
        throw new HttpException(404, "User not found")
      }
        
      await prisma.userProject.deleteMany({
        where: { userID: userID },
      })
      
      await prisma.auditLog.deleteMany({
        where: { userID: userID },
      })
      const auditLogs = await prisma.auditLog.findMany({
        where: { userID: userID },
      })
  
      await prisma.user.delete({
        where: { userID: userID },
      })
            
      return { success: true, message: "User deleted successfully" }
    } catch (err) {
      //console.error(`Error al eliminar usuario ${userID}:`, err)
      
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
      
      throw new HttpException(500, `Error deleting user: ` + err)
    }
  }

  async updateUserProjects(data: UpdateUserProjectsDTO) {
    try {
      // Check if user exists
      const user = await prisma.user.findUnique({
        where: { userID: data.userID },
      })

      if (!user) {
        throw new HttpException(404, "User not found")
      }

      // Get current project assignments
      const currentAssignments = await prisma.userProject.findMany({
        where: { userID: data.userID },
      })

      // Create a map of new project assignments for easy lookup
      const newAssignmentsMap = new Map(
        data.projects.map(project => [project.projectID, project.projectRole])
      )

      // Delete assignments that are not in the new list
      const assignmentsToDelete = currentAssignments.filter(
        assignment => !newAssignmentsMap.has(assignment.projectID)
      )

      if (assignmentsToDelete.length > 0) {
        await prisma.userProject.deleteMany({
          where: {
            AND: [
              { userID: data.userID },
              { projectID: { in: assignmentsToDelete.map(a => a.projectID) } }
            ]
          }
        })
      }

      // Update or create new assignments
      const operations = data.projects.map(project => {
        return prisma.userProject.upsert({
          where: {
            userID_projectID: {
              userID: data.userID,
              projectID: project.projectID
            }
          },
          update: {
            projectRole: project.projectRole
          },
          create: {
            userID: data.userID,
            projectID: project.projectID,
            projectRole: project.projectRole
          }
        })
      })

      await prisma.$transaction(operations)

      // Return updated assignments
      const updatedAssignments = await prisma.userProject.findMany({
        where: { userID: data.userID },
        include: {
          project: true
        }
      })

      return updatedAssignments
    } catch (err) {
      if (err instanceof HttpException) {
        throw err
      }
      throw new HttpException(500, `Error updating user projects: ${err instanceof Error ? err.message : String(err)}`)
    }
  }

  async updateProfilePicture(userID: number, imageUrl: string): Promise<User> {
    try {
      const user = await prisma.user.findUnique({
        where: { userID }
      });

      if (!user) {
        throw new HttpException(404, "User not found");
      }

      const userData: UpdateUserDTO = {
        profilePicture: imageUrl
      };

      const updatedUser = await prisma.user.update({
        where: { userID },
        data: userData
      });

      return updatedUser;
    } catch (err) {
      if (err instanceof HttpException) {
        throw err;
      }
      throw new HttpException(500, "Error updating profile picture: " + err);
    }
  }
}
export default UserService;