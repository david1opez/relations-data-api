import { Request, Response, NextFunction } from "express";
import DepartmentController from "../controllers/department";
import HttpException from "../models/http-exception";

export default class DepartmentHandler {
  public departmentController: DepartmentController;

  constructor() {
    this.departmentController = new DepartmentController();
  }

  // GET /departments
  public async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const depts = await this.departmentController.getAllDepartments();
      res.status(200).json(depts);
    } catch (err) {
      next(err);
    }
  }

  // POST /departments
  public async create(req: Request, res: Response, next: NextFunction) {
    try {
      const { name } = req.body;
      if (!name) {
        throw new HttpException(400, "Department name is required");
      }
      const dept = await this.departmentController.createDepartment(name);
      res.status(201).json(dept);
    } catch (err) {
      next(err);
    }
  }

  // DELETE /departments/:departmentID
  public async remove(req: Request, res: Response, next: NextFunction) {
    try {
      const { departmentID } = req.params;
      if (!departmentID) {
        throw new HttpException(400, "Department ID is required");
      }
      const id = parseInt(departmentID, 10);
      await this.departmentController.deleteDepartment(id);
      res.sendStatus(204);
    } catch (err) {
      next(err);
    }
  }
}
