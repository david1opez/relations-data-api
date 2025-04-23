// src/services/department.ts
import prisma from '../../client'
import HttpException from '../models/http-exception'

class DepartmentService {
  async getAllDepartments() {
    try {
      return await prisma.department.findMany()
    } catch (err) {
      throw new HttpException(500, 'Error fetching departments: ' + err)
    }
  }

  async createDepartment(name: string) {
    try {
      return await prisma.department.create({ data: { name } })
    } catch (err: any) {
      if (err.code === 'P2002') {
        throw new HttpException(400, 'El departamento ya existe')
      }
      throw new HttpException(500, 'Error creating department: ' + err)
    }
  }

  async deleteDepartment(id: number) {
    try {
      await prisma.department.delete({ where: { departmentID: id } })
      return
    } catch (err: any) {
      if (err.code === 'P2025') {
        throw new HttpException(404, 'Departamento no encontrado')
      }
      throw new HttpException(500, 'Error deleting department: ' + err)
    }
  }
}

export default DepartmentService