import ProjectController from '../project';
import { prismaMock } from '../../../tests/prismaTestClient';
import HttpException from '../../models/http-exception';
import { PrismaClient } from '@prisma/client';

describe('ProjectController', () => {
    let projectController: ProjectController;

    beforeEach(() => {
        projectController = new ProjectController(prismaMock as unknown as PrismaClient);
    });

    describe('getAllProjects', () => {
        it('should return all projects', async () => {
            const mockProjects = [
                { 
                    projectID: 1, 
                    name: 'Project 1', 
                    description: 'Test project 1',
                    problemDescription: null,
                    reqFuncionales: null,
                    reqNoFuncionales: null,
                    startDate: null, 
                    endDate: null,
                    clientEmail: null,
                    reports: [
                        {
                            reportID: 1,
                            reportType: 'Summary',
                            generatedAt: new Date('2025-06-01T13:00:00Z'),
                            fileURL: 'http://example.com/report1.pdf',
                            format: 'PDF'
                        }
                    ]
                },
                { 
                    projectID: 2, 
                    name: 'Project 2', 
                    description: 'Test project 2',
                    problemDescription: null,
                    reqFuncionales: null,
                    reqNoFuncionales: null,
                    startDate: null, 
                    endDate: null,
                    clientEmail: null,
                    reports: []
                }
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
                    project: { 
                        projectID: 1, 
                        name: 'Project 1', 
                        description: 'Test project 1', 
                        startDate: new Date('2025-06-01T10:00:00Z'),
                        endDate: new Date('2025-06-01T18:00:00Z'),
                        reports: [
                            {
                                reportID: 1,
                                reportType: 'Progress',
                                generatedAt: new Date('2025-06-01T15:00:00Z'),
                                fileURL: 'http://example.com/progress1.pdf',
                                format: 'PDF'
                            }
                        ]
                    }
                },
                {
                    userID: 1,
                    projectID: 2,
                    projectRole: null,
                    project: { 
                        projectID: 2, 
                        name: 'Project 2', 
                        description: 'Test project 2', 
                        startDate: null, 
                        endDate: null,
                        reports: []
                    }
                }
            ];

            prismaMock.userProject.findMany.mockResolvedValue(mockUserProjects);

            const result = await projectController.getUserProjects(userID);
            
            expect(result).toEqual(mockUserProjects);
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
            project: {
              projectID: 10,
              name: 'Proyecto Test',
              description: 'Descripción',
              problemDescription: null,
              reqFuncionales: null,
              reqNoFuncionales: null,
              startDate: null,
              endDate: null,
              clientEmail: null
            },
            assignedUsers: input.users
          };
      
          const spy = jest.spyOn(projectController['projectService'], 'addProject')
            .mockResolvedValue(mockResult);
      
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
          const mockDeleted = {
            projectID,
            name: 'X',
            description: 'Desc',
            problemDescription: null,
            reqFuncionales: null,
            reqNoFuncionales: null,
            startDate: null,
            endDate: null,
            clientEmail: null
          };
      
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
    
    describe('updateProjectUsers', () => {
      it('debe devolver los usuarios actualizados correctamente', async () => {
        const controller = new ProjectController();
    
        const input = {
          projectID: 1,
          users: [
            { userID: 1, projectRole: 'Member' },
            { userID: 2, projectRole: 'Admin' },
          ],
        };
    
        const mockResponse = [
          { userID: 1, projectID: 1, projectRole: 'Member' },
          { userID: 2, projectID: 1, projectRole: 'Admin' },
        ];
    
        jest
          .spyOn(controller['projectService'], 'updateProjectUsers')
          .mockResolvedValue(mockResponse);
    
        const result = await controller.updateProjectUsers(input);
    
        expect(result).toEqual(mockResponse);
      });
      it('debe propagar un HttpException si el servicio lo lanza', async () => {
        const controller = new ProjectController();
    
        const input = {
          projectID: 1,
          users: [],
        };
    
        const error = new HttpException(400, 'Bad request');
    
        jest
          .spyOn(controller['projectService'], 'updateProjectUsers')
          .mockRejectedValue(error);
    
        await expect(controller.updateProjectUsers(input)).rejects.toThrow(HttpException);
        await expect(controller.updateProjectUsers(input)).rejects.toMatchObject({
          errorCode: 400,
        });
      });
      it('debe lanzar HttpException(500) si ocurre un error inesperado', async () => {
        const controller = new ProjectController();
    
        const input = {
          projectID: 1,
          users: [],
        };
    
        const unexpectedError = new Error('DB failure');
    
        jest
          .spyOn(controller['projectService'], 'updateProjectUsers')
          .mockRejectedValue(unexpectedError);
    
        await expect(controller.updateProjectUsers(input)).rejects.toThrow(HttpException);
        await expect(controller.updateProjectUsers(input)).rejects.toMatchObject({
          errorCode: 500,
        });
      });
    });        

    describe('getProjectUsers', () => {
        const mockProject = {
            projectID: 123,
            name: 'Test Project',
            description: null,
            problemDescription: null,
            reqFuncionales: null,
            reqNoFuncionales: null,
            startDate: null,
            endDate: null,
            clientEmail: null
        };

        beforeEach(() => {
            prismaMock.project.findUnique.mockReset();
        });

        it('should return users when project exists', async () => {
            const mockUsers = [
                { userID: 1, name: 'John Doe', projectRole: 'Admin' },
                { userID: 2, name: 'Jane Smith', projectRole: 'Member' }
            ];

            prismaMock.project.findUnique.mockResolvedValue(mockProject);
            jest
                .spyOn(projectController['projectService'], 'getProjectUsers')
                .mockResolvedValue(mockUsers);

            const result = await projectController.getProjectUsers(mockProject.projectID);

            expect(result).toEqual(mockUsers);
            expect(prismaMock.project.findUnique).toHaveBeenCalledWith({
                where: { projectID: mockProject.projectID }
            });
        });

        it('should throw HttpException(404) if project does not exist', async () => {
            prismaMock.project.findUnique.mockResolvedValue(null);

            await expect(projectController.getProjectUsers(999))
                .rejects
                .toThrow(HttpException);

            await expect(projectController.getProjectUsers(999))
                .rejects
                .toMatchObject({
                    errorCode: 404,
                    message: 'Project not found'
                });
        });

        it('should propagate HttpException from service', async () => {
            const error = new HttpException(500, 'Service error');

            prismaMock.project.findUnique.mockResolvedValue(mockProject);
            jest
                .spyOn(projectController['projectService'], 'getProjectUsers')
                .mockRejectedValue(error);

            await expect(projectController.getProjectUsers(mockProject.projectID))
                .rejects
                .toThrow(error);
        });

        it('should throw HttpException(500) for unexpected errors', async () => {
            const error = new Error('Unexpected error');

            prismaMock.project.findUnique.mockResolvedValue(mockProject);
            jest
                .spyOn(projectController['projectService'], 'getProjectUsers')
                .mockRejectedValue(error);

            await expect(projectController.getProjectUsers(mockProject.projectID))
                .rejects
                .toThrow(HttpException);

            await expect(projectController.getProjectUsers(mockProject.projectID))
                .rejects
                .toMatchObject({
                    errorCode: 500,
                    message: 'Error getting project users'
                });
        });
    });
});