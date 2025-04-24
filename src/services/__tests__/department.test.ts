import DepartmentService from '../department';
import { prismaMock } from '../../../tests/prismaTestClient';
import HttpException from '../../models/http-exception';

describe('DepartmentService', () => {
  let svc: DepartmentService;
  beforeEach(() => {
    svc = new DepartmentService();
  });

  describe('getAllDepartments', () => {
    it('debe listar todos los departamentos', async () => {
      const mock = [{ departmentID: 1, name: 'Ventas' }];
      prismaMock.department.findMany.mockResolvedValue(mock);

      await expect(svc.getAllDepartments()).resolves.toEqual(mock);
    });
  });

  describe('createDepartment', () => {
    it('debe crear un departamento nuevo', async () => {
      const dept = { departmentID: 2, name: 'RRHH' };
      prismaMock.department.create.mockResolvedValue(dept);

      await expect(svc.createDepartment('RRHH')).resolves.toEqual(dept);
    });

    it('debe lanzar HttpException si el nombre ya existe', async () => {
      const err: any = new Error();
      err.code = 'P2002';
      prismaMock.department.create.mockRejectedValue(err);

      await expect(svc.createDepartment('Ventas')).rejects.toThrow(
        HttpException
      );
    });
  });

  describe('deleteDepartment', () => {
    it('debe eliminar un departamento sin error', async () => {
      const deleted = { departmentID: 1, name: 'Ventas' };
      prismaMock.department.delete.mockResolvedValue(deleted);

      // tu servicio deleteDepartment retorna void
      await expect(svc.deleteDepartment(1)).resolves.toBeUndefined();
    });

    it('debe lanzar HttpException si falla la BD al eliminar', async () => {
      prismaMock.department.delete.mockRejectedValue(new Error('DB error'));

      await expect(svc.deleteDepartment(1)).rejects.toThrow(HttpException);
    });
  });
});