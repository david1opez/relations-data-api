// src/handlers/__tests__/department.test.ts

import DepartmentHandler from '../department';                // <-- handler, no controller
import { Request, Response } from 'express';
import HttpException from '../../models/http-exception';    // <-- un nivel más arriba

describe('DepartmentHandler', () => {
  let h: DepartmentHandler;
  let req: Partial<Request>;
  let res: Partial<Response>;
  let next: jest.Mock;

  beforeEach(() => {
    h = new DepartmentHandler();
    req = {};
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      sendStatus: jest.fn(),
    };
    next = jest.fn();
  });

  describe('GET /departments → 200 + json', () => {
    it('debe devolver lista de departamentos', async () => {
      const data = [{ departmentID: 1, name: 'Ventas' }];
      jest
        .spyOn((h as any).departmentController, 'getAllDepartments')
        .mockResolvedValue(data);

      await h.getAll(req as Request, res as Response, next);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(data);
      expect(next).not.toHaveBeenCalled();
    });
  });

  describe('POST /departments → 201 + json', () => {
    it('debe crear y devolver el nuevo departamento', async () => {
      const dept = { departmentID: 2, name: 'RRHH' };
      jest
        .spyOn((h as any).departmentController, 'createDepartment')
        .mockResolvedValue(dept);

      req.body = { name: 'RRHH' };
      await h.create(req as Request, res as Response, next);

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(dept);
      expect(next).not.toHaveBeenCalled();
    });

    it('debe llamar a next(HttpException) si falta el nombre', async () => {
      req.body = {}; // sin name

      await h.create(req as Request, res as Response, next);

      expect(next).toHaveBeenCalled();
      const err = next.mock.calls[0][0] as HttpException;
      expect(err.errorCode).toBe(400);
      expect(err.message).toBe('Department name is required');
    });
  });

  describe('DELETE /departments/:departmentID → 204', () => {
    it('debe eliminar y responder 204', async () => {
      jest
        .spyOn((h as any).departmentController, 'deleteDepartment')
        .mockResolvedValue(undefined);

      req.params = { departmentID: '1' };
      await h.remove(req as Request, res as Response, next);

      expect(res.sendStatus).toHaveBeenCalledWith(204);
      expect(next).not.toHaveBeenCalled();
    });

    it('debe llamar a next(HttpException) si falta el ID', async () => {
      req.params = {};
      await h.remove(req as Request, res as Response, next);

      expect(next).toHaveBeenCalled();
      const err = next.mock.calls[0][0] as HttpException;
      expect(err.errorCode).toBe(400);
      expect(err.message).toBe('Department ID is required');
    });
  });
});