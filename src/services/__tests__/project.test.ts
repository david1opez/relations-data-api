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
          endDate: new Date('2025-06-01T18:00:00Z'), },
        { projectID: 2, name: 'Project B', description: 'Some desc', startDate: new Date('2025-06-01'),
          endDate: new Date('2027-06-01'), },
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
          project: { projectID: 10, name: 'Alpha', description: null },
        },
        {
          userID: 1,
          projectID: 20,
          projectRole: 'Owner',
          project: { projectID: 20, name: 'Beta', description: 'Beta desc' },
        },
      ];
      prismaMock.userProject.findMany.mockResolvedValue(mockUserProjects);

      const result = await svc.getUserProjects(1);
      expect(result).toEqual([
        mockUserProjects[0].project,
        mockUserProjects[1].project,
      ]);
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
  
      const mockProject = { projectID, name: 'Proyecto X', description: 'Test' };
  
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
  
      prismaMock.project.findUnique.mockResolvedValue({ projectID, name: 'X', description: '' });
      prismaMock.project.delete.mockRejectedValue(new Error('DB fail'));
  
      await expect(svc.deleteProject(projectID)).rejects.toThrow(HttpException);
      await expect(svc.deleteProject(projectID)).rejects.toMatchObject({
        errorCode: 500,
      });
    });
  });      
});