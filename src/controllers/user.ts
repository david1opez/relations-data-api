import UserService from "../services/user"
import type { UpdateUserDTO } from "../interfaces/user"

class UserController {
  private userService: UserService

  constructor() {
    this.userService = new UserService()
  }

  async checkLogin(userID: number, password: string) {
    try {
      const user = await this.userService.checkLogin(userID, password)
      return user
    } catch (err) {
      throw new Error("Error checking login: " + err)
    }
  }

  async getUser(userID: number) {
    try {
      const user = await this.userService.getUser(userID)
      return user
    } catch (err) {
      throw new Error("Error fetching user: " + err)
    }
  }

  async getAllUsers() {
    try {
      const users = await this.userService.getAllUsers()
      return users
    } catch (err) {
      throw new Error("Error fetching users: " + err)
    }
  }

  async createUser(userData: { name: string; email: string; password?: string; role?: string; departmentID?: number }) {
    try {
      const user = await this.userService.createUser(userData)
      return user
    } catch (err) {
      throw new Error("Error creating user: " + err)
    }
  }

  async updateUser(userID: number, userData: UpdateUserDTO) {
    try {
      const user = await this.userService.updateUser(userID, userData)
      return user
    } catch (err) {
      throw new Error("Error updating user: " + err)
    }
  }

  async deleteUser(userID: number) {
    try {
      const result = await this.userService.deleteUser(userID)
      return result
    } catch (err) {
      throw new Error("Error deleting user: " + err)
    }
  }
}

export default UserController
