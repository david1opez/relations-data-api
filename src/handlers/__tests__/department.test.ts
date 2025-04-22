import DepartmentHandler from '../department';
import { Request, Response } from 'express';
import HttpException from '../../models/http-exception';

describe('DepartmentHandler', () => {
  let h: DepartmentHandler;
  let req: Partial<Request>, res: Partial<Response>, next: jest.Mock;

  beforeEach(() => {
    h = new DepartmentHandler();
    res = { status: jest.fn().mockReturnThis(), json: jest.fn(), sendStatus: jest.fn() };
    next = jest.fn();
  });

  it('GET /departments → 200 + json', async () => {
    const data = [{ departmentID:1, name:'Ventas' }];
    jest.spyOn(h as any, 'getAll').mockResolvedValue(data);
    await h.getAll(req as Request, res as Response, next);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(data);
  });

  it('POST /departments sin nombre → llama next(HttpException)', async () => {
    req = { body: {} };
    await h.create(req as Request, res as Response, next);
    expect(next).toHaveBeenCalledWith(expect.any(HttpException));
  });

  it('POST /departments ok → 201 + json', async () => {
    req = { body: { name: 'Soporte' } };
    const dept = { departmentID:3, name:'Soporte' };
    jest.spyOn(h as any, 'create').mockResolvedValue(dept);
    await h.create(req as Request, res as Response, next);
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith(dept);
  });

  it('DELETE /departments/:id ok → 204', async () => {
    req = { params: { departmentID:'1' } };
    jest.spyOn(h as any, 'remove').mockResolvedValue(undefined);
    await h.remove(req as Request, res as Response, next);
    expect(res.sendStatus).toHaveBeenCalledWith(204);
  });

  it('DELETE /departments/:id inválido → next(HttpException)', async () => {
    req = { params: { departmentID:'foo' } };
    await h.remove(req as Request, res as Response, next);
    expect(next).toHaveBeenCalledWith(expect.any(HttpException));
  });
});