import DepartmentService from '../services/department';
import { Department } from '@prisma/client';

class DepartmentController {
  private departmentService: DepartmentService;

  constructor() {
    this.departmentService = new DepartmentService();
  }

  /** Devuelve todos los departamentos */
  async getAllDepartments(): Promise<Department[]> {
    return this.departmentService.getAllDepartments();
  }

  /** Crea un departamento nuevo */
  async createDepartment(name: string): Promise<Department> {
    return this.departmentService.createDepartment(name);
  }

  /** Elimina un departamento existente */
  async deleteDepartment(departmentID: number): Promise<void> {
    return this.departmentService.deleteDepartment(departmentID);
  }
}

export default DepartmentController;