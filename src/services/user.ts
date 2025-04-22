import prisma from "../../client"
import HttpException from "../models/http-exception"

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

  async deleteUser(userID: number) {
    try {
      // Check if user exists
      const user = await prisma.user.findUnique({
        where: { userID: userID },
      })
      if (!user) {
        throw new HttpException(404, "User not found")
      }

      // Delete user
      await prisma.user.delete({
        where: { userID: userID },
      })
      return { success: true, message: "User deleted successfully" }
    } catch (err) {
      if (err instanceof HttpException) {
        throw err
      }
      throw new HttpException(500, "Error deleting user: " + err)
    }
  }
}

export default UserService
