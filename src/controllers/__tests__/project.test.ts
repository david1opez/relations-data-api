import ProjectController from '../project';
import { prismaMock } from '../../../tests/prismaTestClient';
import HttpException from '../../models/http-exception';

describe('ProjectController', () => {
    let projectController: ProjectController;

    beforeEach(() => {
        projectController = new ProjectController();
    });

    describe('getAllProjects', () => {
        it('should return all projects', async () => {
            const mockProjects = [
                { projectID: 1, name: 'Project 1', description: 'Test project 1', startDate: null, endDate: null },
                { projectID: 2, name: 'Project 2', description: 'Test project 2', startDate: null, endDate: null }
            ];

            prismaMock.project.findMany.mockResolvedValue(mockProjects);

            const result = await projectController.getAllProjects();
            
            expect(result).toEqual(mockProjects);
            expect(prismaMock.project.findMany).toHaveBeenCalledTimes(1);
        });

        it('should throw error when database query fails', async () => {
            const error = new Error('Database error');
            prismaMock.project.findMany.mockRejectedValue(error);

            await expect(projectController.getAllProjects()).rejects.toThrow('Error fetching projects');
        });
    });

    describe('getUserProjects', () => {
        it('should return projects for a specific user', async () => {
            const userID = 1;
            const mockUserProjects = [
                {
                    userID: 1,
                    projectID: 1,
                    projectRole: null,
                    project: { projectID: 1, name: 'Project 1', description: 'Test project 1', startDate: new Date('2025-06-01T10:00:00Z'),
                        endDate: new Date('2025-06-01T18:00:00Z'), }
                },
                {
                    userID: 1,
                    projectID: 2,
                    projectRole: null,
                    project: { projectID: 2, name: 'Project 2', description: 'Test project 2', startDate: null, endDate: null }
                }
            ];

            prismaMock.userProject.findMany.mockResolvedValue(mockUserProjects);

            const result = await projectController.getUserProjects(userID);
            
            expect(result).toEqual(mockUserProjects.map(up => up.project));
            expect(prismaMock.userProject.findMany).toHaveBeenCalledWith({
                where: { userID },
                include: { project: true }
            });
        });

        it('should throw error when database query fails', async () => {
            const userID = 1;
            const error = new Error('Database error');
            prismaMock.userProject.findMany.mockRejectedValue(error);

            await expect(projectController.getUserProjects(userID)).rejects.toThrow('Error fetching user projects');
        });
    });
    
    describe('addProject', () => {
        it('debe retornar el proyecto agregado cuando el servicio funciona', async () => {
          const input = {
            name: 'Proyecto Test',
            description: 'Descripción',
            users: [{ userID: 1, projectRole: 'Owner' }]
          };
      
          const mockResult = {
            project: { projectID: 10, name: 'Proyecto Test', description: 'Descripción' },
            assignedUsers: input.users
          };
      
          // Mock del método del servicio
          const spy = jest.spyOn(projectController['projectService'], 'addProject').mockResolvedValue(mockResult);
      
          const result = await projectController.addProject(input);
      
          expect(result).toEqual(mockResult);
          expect(spy).toHaveBeenCalledWith(input);
        });
        it('debe propagar HttpException si el servicio lanza una excepción controlada', async () => {
            const input = {
              name: 'Proyecto inválido',
              description: 'Descripción',
              users: []
            };
        
            const error = new HttpException(400, 'Error controlado');
        
            jest.spyOn(projectController['projectService'], 'addProject').mockRejectedValue(error);
        
            await expect(projectController.addProject(input)).rejects.toThrow(HttpException);
          });
        it('debe lanzar HttpException(500) si ocurre un error inesperado', async () => {
        const input = {
            name: 'Proyecto con error',
            description: 'Descripción',
            users: []
        };
    
        const error = new Error('DB falla');
    
        jest.spyOn(projectController['projectService'], 'addProject').mockRejectedValue(error);
    
        await expect(projectController.addProject(input)).rejects.toThrow(HttpException);
        });
    });
    
    describe('deleteProject', () => {
        it('debe eliminar el proyecto si el servicio lo elimina correctamente', async () => {
          const projectID = 123;
          const mockDeleted = { projectID, name: 'X', description: 'Desc' };
      
          const controller = new ProjectController();
          jest
            .spyOn(controller['projectService'], 'deleteProject')
            .mockResolvedValue(mockDeleted);
      
          const result = await controller.deleteProject(projectID);
      
          expect(result).toEqual(mockDeleted);
        });
        it('debe propagar HttpException(404) si el servicio lo lanza', async () => {
            const projectID = 404;
            const err = new HttpException(404, 'Not found');
        
            const controller = new ProjectController();
            jest
              .spyOn(controller['projectService'], 'deleteProject')
              .mockRejectedValue(err);
        
            await expect(controller.deleteProject(projectID)).rejects.toThrow(HttpException);
            await expect(controller.deleteProject(projectID)).rejects.toMatchObject({
              errorCode: 404,
            });
        });
        it('debe lanzar HttpException(500) si ocurre un error inesperado', async () => {
            const projectID = 123;
            const err = new Error('DB fail');
        
            const controller = new ProjectController();
            jest
              .spyOn(controller['projectService'], 'deleteProject')
              .mockRejectedValue(err);
        
            await expect(controller.deleteProject(projectID)).rejects.toThrow(HttpException);
            await expect(controller.deleteProject(projectID)).rejects.toMatchObject({
              errorCode: 500,
            });
        });
    });        
});