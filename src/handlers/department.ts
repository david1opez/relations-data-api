// src/handlers/department.ts
import { Request, Response, NextFunction } from "express";
import DepartmentController from "../controllers/department";
import HttpException from "../models/http-exception";

class DepartmentHandler {
  private ctrl = new DepartmentController();

  async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const depts = await this.ctrl.getAll();
      res.status(200).json(depts);
    } catch (e) {
      next(e);
    }
  }

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const { name } = req.body;
      if (!name) throw new HttpException(400, "El nombre es requerido");
      const dept = await this.ctrl.create(name);
      res.status(201).json(dept);
    } catch (e) {
      next(e);
    }
  }

  async remove(req: Request, res: Response, next: NextFunction) {
    try {
      const id = Number(req.params.departmentID);
      if (isNaN(id)) throw new HttpException(400, "ID inválido");
      await this.ctrl.remove(id);
      res.sendStatus(204);
    } catch (e) {
      next(e);
    }
  }
}

export default DepartmentHandler;