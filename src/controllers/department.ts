// src/controllers/department.ts
import DepartmentService from "../services/department";

class DepartmentController {
  private service = new DepartmentService();

  async getAll() {
    return this.service.getAllDepartments();
  }

  async create(name: string) {
    return this.service.createDepartment(name);
  }

  async remove(id: number) {
    return this.service.deleteDepartment(id);
  }
}

export default DepartmentController;