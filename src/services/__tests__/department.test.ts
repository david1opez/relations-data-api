import DepartmentService from '../department';
import { prismaMock } from '../../../tests/prismaTestClient';
import HttpException from '../../models/http-exception';

describe('DepartmentService', () => {
  let svc: DepartmentService;
  beforeEach(() => { svc = new DepartmentService() });

  it('getAllDepartments() → lista de departamentos', async () => {
    const mock = [{ departmentID:1, name:'Ventas' }];
    prismaMock.department.findMany.mockResolvedValue(mock);
    await expect(svc.getAllDepartments()).resolves.toEqual(mock);
  });

  it('createDepartment() → crea uno nuevo', async () => {
    const dept = { departmentID:2, name:'RRHH' };
    prismaMock.department.create.mockResolvedValue(dept);
    await expect(svc.createDepartment('RRHH')).resolves.toEqual(dept);
  });

  it('deleteDepartment() → elimina sin error', async () => {
    prismaMock.department.delete.mockResolvedValue(undefined);
    await expect(svc.deleteDepartment(1)).resolves.toBeUndefined();
  });

  it('createDepartment() lanza 400 si ya existe', async () => {
    const err: any = new Error(); err.code = 'P2002';
    prismaMock.department.create.mockRejectedValue(err);
    await expect(svc.createDepartment('Ventas'))
      .rejects.toThrow(HttpException);
  });
});