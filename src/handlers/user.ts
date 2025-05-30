import UserController from "../controllers/user"
import HttpException from "../models/http-exception"
import type { Request, Response, NextFunction } from "express"
import type { UpdateUserDTO, UpdateUserProjectsDTO } from "../interfaces/user"
import { User } from "@prisma/client"
import multer from "multer"
import path from "path"
import fs from "fs"

// Configurar multer para el almacenamiento de archivos
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const uploadDir = 'uploads/profile-pictures'
        // Crear el directorio si no existe
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true })
        }
        cb(null, uploadDir)
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
        cb(null, 'profile-' + uniqueSuffix + path.extname(file.originalname))
    }
})

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB limit
    },
    fileFilter: (req, file, cb) => {
        const allowedTypes = ['image/jpeg', 'image/png', 'image/gif']
        if (!allowedTypes.includes(file.mimetype)) {
            cb(new Error('Invalid file type. Only JPEG, PNG and GIF are allowed'))
            return
        }
        cb(null, true)
    }
}).single('image')

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

  public async updateUserProjects(req: Request, res: Response, next: NextFunction) {
    try {
      const { userID, projects } = req.body

      if (!userID || !projects || !Array.isArray(projects)) {
        throw new HttpException(400, "User ID and projects array are required")
      }

      const userIDInt = Number.parseInt(userID as string)
      if (isNaN(userIDInt)) {
        throw new HttpException(400, "User ID must be a number")
      }

      // Validate each project assignment
      for (const project of projects) {
        if (!project.projectID || typeof project.projectID !== 'number') {
          throw new HttpException(400, "Each project must have a valid projectID")
        }
        if (project.projectRole && typeof project.projectRole !== 'string') {
          throw new HttpException(400, "Project role must be a string if provided")
        }
      }

      const data: UpdateUserProjectsDTO = {
        userID: userIDInt,
        projects
      }

      const result = await this.userController.updateUserProjects(data)
      res.status(200).json(result)
    } catch (err) {
      next(err)
    }
  }

  public uploadProfilePicture = async (req: Request, res: Response, next: NextFunction) => {
    upload(req, res, async (err) => {
      try {
        if (err instanceof multer.MulterError) {
          throw new HttpException(400, `File upload error: ${err.message}`)
        } else if (err) {
          throw new HttpException(400, err.message)
        }

        if (!req.file) {
          throw new HttpException(400, 'No file uploaded')
        }

        // Obtener el userID del token o sesión
        const userID = (req as any).user?.userID
        if (!userID) {
          throw new HttpException(401, 'User not authenticated')
        }

        // Construir la URL de la imagen
        const baseUrl = 'https://relations-data-api.vercel.app'
        const imageUrl = `${baseUrl}/${req.file.path}`

        const updatedUser = await this.userController.uploadProfilePicture(userID, imageUrl)

        res.status(200).json({
          message: 'Profile picture updated successfully',
          user: updatedUser
        })
      } catch (error) {
        next(error)
      }
    })
  }
}

export default UserHandler