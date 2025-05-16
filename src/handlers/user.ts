import UserController from "../controllers/user"
import HttpException from "../models/http-exception"
import type { Request, Response, NextFunction } from "express"
import type { UpdateUserDTO } from "../interfaces/user"

class UserHandler {
  private userController: UserController

  constructor() {
    this.userController = new UserController()
  }

  public async checkLogin(req: Request, res: Response, next: NextFunction) {
    try {
      const { userID, password } = req.body

      if (!userID || !password) {
        throw new HttpException(400, "User ID and password are required")
      }

      const userIDInt = Number.parseInt(userID as string)
      if (isNaN(userIDInt)) {
        throw new HttpException(400, "User ID must be a number")
      }

      const passwordString = password.toString()
      if (passwordString.length === 0) {
        throw new HttpException(400, "Password cannot be empty")
      }

      const user = await this.userController.checkLogin(userIDInt, passwordString)
      res.status(200).json(user)
    } catch (err) {
      next(err)
    }
  }

  public async getUser(req: Request, res: Response, next: NextFunction) {
    try {
      const { userID } = req.params

      if (!userID) {
        throw new HttpException(400, "User ID is required")
      }

      const userIDInt = Number.parseInt(userID)
      if (isNaN(userIDInt)) {
        throw new HttpException(400, "User ID must be a number")
      }

      const user = await this.userController.getUser(userIDInt)
      res.status(200).json(user)
    } catch (err) {
      next(err)
    }
  }

  public async getAllUsers(req: Request, res: Response, next: NextFunction) {
    try {
      const users = await this.userController.getAllUsers()
      res.status(200).json(users)
    } catch (err) {
      next(err)
    }
  }

  public async createUser(req: Request, res: Response, next: NextFunction) {
    try {
      const { name, email, password, role, departmentID } = req.body

      if (!name || !email) {
        throw new HttpException(400, "Name and email are required")
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(email)) {
        throw new HttpException(400, "Invalid email format")
      }

      // Convert departmentID to number if provided
      let departmentIDInt: number | undefined = undefined
      if (departmentID) {
        departmentIDInt = Number.parseInt(departmentID as string)
        if (isNaN(departmentIDInt)) {
          throw new HttpException(400, "Department ID must be a number")
        }
      }

      const userData = {
        name,
        email,
        password,
        role,
        departmentID: departmentIDInt,
      }

      const user = await this.userController.createUser(userData)
      res.status(201).json(user)
    } catch (err) {
      next(err)
    }
  }
  public async updateUser(req: Request, res: Response, next: NextFunction) {
    try {
      const { userID } = req.params
      const { name, email, password, role, departmentID } = req.body

      if (!userID) {
        throw new HttpException(400, "User ID is required")
      }

      const userIDInt = Number.parseInt(userID)
      if (isNaN(userIDInt)) {
        throw new HttpException(400, "User ID must be a number")
      }

      // Validate email format if provided
      if (email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (!emailRegex.test(email)) {
          throw new HttpException(400, "Invalid email format")
        }
      }

      // Convert departmentID to number if provided
      let departmentIDInt: number | undefined = undefined
      if (departmentID) {
        departmentIDInt = Number.parseInt(departmentID as string)
        if (isNaN(departmentIDInt)) {
          throw new HttpException(400, "Department ID must be a number")
        }
      }

      const userData: UpdateUserDTO = {}

      // Only include fields that are provided
      if (name !== undefined) userData.name = name
      if (email !== undefined) userData.email = email
      if (password !== undefined) userData.password = password
      if (role !== undefined) userData.role = role
      if (departmentIDInt !== undefined) userData.departmentID = departmentIDInt

      const user = await this.userController.updateUser(userIDInt, userData)
      res.status(200).json(user)
    } catch (err) {
      next(err)
    }
  }

  public async deleteUser(req: Request, res: Response, next: NextFunction) {
    try {
      const { userID } = req.params

      if (!userID) {
        throw new HttpException(400, "User ID is required")
      }

      const userIDInt = Number.parseInt(userID)
      if (isNaN(userIDInt)) {
        throw new HttpException(400, "User ID must be a number")
      }

      const result = await this.userController.deleteUser(userIDInt)
      res.status(200).json(result)
    } catch (err) {
      next(err)
    }
  }
}

export default UserHandler
