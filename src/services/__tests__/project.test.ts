// src/services/__tests__/project.test.ts

import ProjectService from '../project';
import { prismaMock } from '../../../tests/prismaTestClient';
import HttpException from '../../models/http-exception';

describe('ProjectService', () => {
  let svc: ProjectService;
  beforeEach(() => {
    svc = new ProjectService();
  });

  describe('getAllProjects', () => {
    it('debe devolver todos los proyectos', async () => {
      const mockProjects = [
        { projectID: 1, name: 'Project A', description: null, startDate: new Date('2025-06-01T10:00:00Z'),
          endDate: new Date('2025-06-01T18:00:00Z'), reports: [
            {
              reportID: 1,
              reportType: 'Summary',
              generatedAt: new Date('2025-06-01T13:00:00Z'),
              fileURL: 'http://example.com/report1.pdf',
              format: 'PDF'
            }
          ], },
        { projectID: 2, name: 'Project B', description: 'Some desc', startDate: new Date('2025-06-01'),
          endDate: new Date('2027-06-01'), reports: [], },
      ];
      prismaMock.project.findMany.mockResolvedValue(mockProjects);

      await expect(svc.getAllProjects()).resolves.toEqual(mockProjects);
    });

    it('debe lanzar HttpException si falla la BD', async () => {
      prismaMock.project.findMany.mockRejectedValue(new Error('DB error'));

      await expect(svc.getAllProjects()).rejects.toThrow(HttpException);
    });
  });

  describe('getUserProjects', () => {
    it('debe devolver los proyectos de un usuario', async () => {
      const mockUserProjects = [
        {
          userID: 1,
          projectID: 10,
          projectRole: null,
          project: { projectID: 10, name: 'Alpha', description: null, reports: [] },
        },
        {
          userID: 1,
          projectID: 20,
          projectRole: 'Owner',
          project: { projectID: 20, name: 'Beta', description: 'Beta desc', reports: [
              {
                reportID: 2,
                reportType: 'Final',
                generatedAt: new Date('2025-07-01T14:00:00Z'),
                fileURL: 'http://example.com/report2.pdf',
                format: 'PDF'
              }
            ], },
        },
      ];
      prismaMock.userProject.findMany.mockResolvedValue(mockUserProjects);

      const result = await svc.getUserProjects(1);
      expect(result).toEqual(mockUserProjects);
    });

    it('debe lanzar HttpException si falla la BD', async () => {
      prismaMock.userProject.findMany.mockRejectedValue(new Error('DB error'));
      await expect(svc.getUserProjects(1)).rejects.toThrow(HttpException);
    });
  });

  describe('addProject', () => {
    it('debe crear un proyecto con usuarios válidos', async () => {
      const svc = new ProjectService();
    
      const mockUsers = [{ userID: 1, projectRole: 'Owner' }, { userID: 2, projectRole: 'Member' }];
      const input = {
        name: 'Nuevo Proyecto',
        description: 'Proyecto de prueba',
        users: mockUsers,
      };
    
      const mockProject = {
        projectID: 123,
        name: input.name,
        description: input.description,
      };
    
      prismaMock.$transaction.mockImplementation(async (callback: any) => {
        return await callback({
          user: {
            findMany: jest.fn().mockResolvedValue([{ userID: 1 }, { userID: 2 }]),
          },
          project: {
            create: jest.fn().mockResolvedValue(mockProject),
          },
          userProject: {
            createMany: jest.fn().mockResolvedValue({ count: 2 }),
          },
        });
      });
    
      const result = await svc.addProject(input);
    
      expect(result).toEqual({
        project: mockProject,
        assignedUsers: mockUsers,
      });
    });
    
    it('debe crear un proyecto sin usuarios asignados', async () => {
      const svc = new ProjectService();
    
      const input = {
        name: 'Proyecto Solo',
        description: 'Sin usuarios',
        users: [],
      };
    
      const mockProject = {
        projectID: 99,
        name: input.name,
        description: input.description,
      };
    
      prismaMock.$transaction.mockImplementation(async (callback:any) => {
        return await callback({
          user: {
            findMany: jest.fn(),
          },
          project: {
            create: jest.fn().mockResolvedValue(mockProject),
          },
          userProject: {
            createMany: jest.fn(),
          },
        });
      });
    
      const result = await svc.addProject(input);
    
      expect(result).toEqual({
        project: mockProject,
        assignedUsers: [],
      });
    });

    it('debe lanzar HttpException(400) si falta el nombre del proyecto', async () => {
      const svc = new ProjectService();
    
      const input = {
        // name: '', <- omitido
        description: 'desc',
        users: [],
      } as any; // forzamos un DTO incompleto
    
      await expect(svc.addProject(input)).rejects.toThrow(HttpException);
    });
    

    it('debe lanzar HttpException(400) si algún usuario no existe', async () => {
      const svc = new ProjectService();
    
      const input = {
        name: 'Proyecto parcial',
        description: 'desc',
        users: [{ userID: 1, projectRole: 'Owner' }, { userID: 99, projectRole: 'Member' }],
      };
    
      prismaMock.$transaction.mockImplementation(async (callback:any) => {
        return await callback({
          user: {
            findMany: jest.fn().mockResolvedValue([{ userID: 1 }]), // solo encontró uno
          },
          project: {
            create: jest.fn(),
          },
          userProject: {
            createMany: jest.fn(),
          },
        });
      });
    
      await expect(svc.addProject(input)).rejects.toThrow(HttpException);
    });    
  });  

  describe('deleteProject', () => {
    it('debe eliminar el proyecto si existe', async () => {
      const svc = new ProjectService();
      const projectID = 101;
  
      const mockProject = { projectID, name: 'Proyecto X', description: 'Test',   startDate: null, endDate: null};
  
      prismaMock.project.findUnique.mockResolvedValue(mockProject);
      prismaMock.project.delete.mockResolvedValue(mockProject);
  
      const result = await svc.deleteProject(projectID);
  
      expect(result).toEqual(mockProject);
      expect(prismaMock.project.findUnique).toHaveBeenCalledWith({ where: { projectID } });
      expect(prismaMock.project.delete).toHaveBeenCalledWith({ where: { projectID } });
    });
    it('debe lanzar HttpException(404) si el proyecto no existe', async () => {
      const svc = new ProjectService();
      const projectID = 404;
  
      prismaMock.project.findUnique.mockResolvedValue(null); // no encontrado
  
      await expect(svc.deleteProject(projectID)).rejects.toThrow(HttpException);
      await expect(svc.deleteProject(projectID)).rejects.toMatchObject({
        errorCode: 404,
        message: `Project with ID ${projectID} not found`,
      });
  
      expect(prismaMock.project.delete).not.toHaveBeenCalled();
    });
    it('debe lanzar HttpException(500) si ocurre un error inesperado', async () => {
      const svc = new ProjectService();
      const projectID = 123;
  
      prismaMock.project.findUnique.mockResolvedValue({ projectID, name: 'X', description: '',  startDate: null, endDate: null});
      prismaMock.project.delete.mockRejectedValue(new Error('DB fail'));
  
      await expect(svc.deleteProject(projectID)).rejects.toThrow(HttpException);
      await expect(svc.deleteProject(projectID)).rejects.toMatchObject({
        errorCode: 500,
      });
    });
  });
  
  describe('updateProjectUsers', () => {
    it('debe actualizar correctamente usuarios asignados a un proyecto', async () => {
      const svc = new ProjectService();
      const input = {
        projectID: 1,
        users: [
          { userID: 1, projectRole: 'Admin' },
          { userID: 2, projectRole: 'Member' }
        ]
      };
  
      const currentRelations = [
        { userID: 2, projectID: 1, projectRole: 'Viewer' },
        { userID: 3, projectID: 1, projectRole: 'Member' },
      ];
  
      prismaMock.project.findUnique.mockResolvedValue({ projectID: 1 } as any);
  
      prismaMock.$transaction.mockImplementation(async (cb: any) => {
        return await cb({
          user: {
            findMany: jest.fn().mockResolvedValue([
              { userID: 1 },
              { userID: 2 },
            ])
          },
          userProject: {
            findMany: jest.fn().mockResolvedValue(currentRelations),
            createMany: jest.fn().mockResolvedValue({ count: 1 }),
            update: jest.fn(),
            deleteMany: jest.fn().mockResolvedValue({ count: 1 })
          }
        });
      });
  
      const result = await svc.updateProjectUsers(input);
      expect(result).toBeDefined();
    });
    it('debe lanzar HttpException(404) si el proyecto no existe', async () => {
      const svc = new ProjectService();
  
      prismaMock.project.findUnique.mockResolvedValue(null);
  
      await expect(
        svc.updateProjectUsers({
          projectID: 999,
          users: [{ userID: 1, projectRole: 'Member' }]
        })
      ).rejects.toMatchObject({ errorCode: 404 });
    });
    it('debe lanzar HttpException(400) si algún usuario no existe', async () => {
      const svc = new ProjectService();
  
      prismaMock.project.findUnique.mockResolvedValue({ projectID: 1 } as any);
  
      prismaMock.$transaction.mockImplementation(async (cb: any) => {
        return await cb({
          user: {
            findMany: jest.fn().mockResolvedValue([{ userID: 1 }]), // falta uno
          },
          userProject: {
            findMany: jest.fn().mockResolvedValue([]),
          }
        });
      });
  
      await expect(
        svc.updateProjectUsers({
          projectID: 1,
          users: [
            { userID: 1, projectRole: 'Admin' },
            { userID: 999, projectRole: 'Member' }
          ]
        })
      ).rejects.toMatchObject({ errorCode: 400 });
    });
    it('debe lanzar HttpException(400) si hay userID duplicados en el body', async () => {
      const svc = new ProjectService();
  
      await expect(
        svc.updateProjectUsers({
          projectID: 1,
          users: [
            { userID: 1, projectRole: 'Admin' },
            { userID: 1, projectRole: 'Viewer' }
          ]
        })
      ).rejects.toMatchObject({
        errorCode: 400,
        message: 'Duplicate userID in request body'
      });
    });
    it('debe lanzar HttpException(500) si ocurre un error inesperado', async () => {
      const svc = new ProjectService();
  
      prismaMock.project.findUnique.mockResolvedValue({ projectID: 1 } as any);
  
      prismaMock.$transaction.mockRejectedValue(new Error('DB error'));
  
      await expect(
        svc.updateProjectUsers({
          projectID: 1,
          users: [
            { userID: 1, projectRole: 'Admin' }
          ]
        })
      ).rejects.toMatchObject({
        errorCode: 500
      });
    });
  });          
});