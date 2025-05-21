// src/handlers/__tests__/project.test.ts

import ProjectHandler from '../project';
import { Request, Response } from 'express';
import HttpException from '../../models/http-exception';

describe('ProjectHandler', () => {
  let projectHandler: ProjectHandler;
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let nextFunction: jest.Mock;

  beforeEach(() => {
    projectHandler = new ProjectHandler();
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json:  jest.fn(),
    };
    nextFunction = jest.fn();
  });

  describe('getAllProjects', () => {
    it('should return 200 with projects when successful', async () => {
      // include description field to satisfy Prisma Project type
      const mockProjects = [
        { projectID: 1, name: 'Project A', description: null },
        { projectID: 2, name: 'Project B', description: 'Some desc' },
      ];

      // stub the controller
      jest
        .spyOn(projectHandler['projectController'], 'getAllProjects')
        .mockResolvedValue(mockProjects as any);

      await projectHandler.getAllProjects(
        mockRequest as Request,
        mockResponse as Response,
        nextFunction
      );

      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith(mockProjects);
      expect(nextFunction).not.toHaveBeenCalled();
    });

    it('should call next with error when controller throws', async () => {
      const err = new Error('Service failed');
      jest
        .spyOn(projectHandler['projectController'], 'getAllProjects')
        .mockRejectedValue(err);

      await projectHandler.getAllProjects(
        mockRequest as Request,
        mockResponse as Response,
        nextFunction
      );

      expect(nextFunction).toHaveBeenCalledWith(err);
    });
  });

  describe('getUserProjects', () => {
    it('should call next with HttpException if userID is missing', async () => {
      mockRequest = { query: {} };

      await projectHandler.getUserProjects(
        mockRequest as Request,
        mockResponse as Response,
        nextFunction
      );

      expect(nextFunction).toHaveBeenCalled();
      const calledWith = nextFunction.mock.calls[0][0] as HttpException;
      // assert the exception's HTTP code property (not `.status`)
      expect(calledWith.errorCode).toBe(400);
      expect(calledWith.message).toBe('User ID is required');
    });

    it('should return 200 with projects when userID is provided', async () => {
      const mockProjects = [
        {
          userID: 1,
          projectID: 10,
          projectRole: null,
          project: { projectID: 10, name: 'Alpha', description: null }
        },
        {
          userID: 1,
          projectID: 20,
          projectRole: 'Owner',
          project: { projectID: 20, name: 'Beta', description: 'Beta project' }
        }
      ];
      mockRequest = { query: { userID: '42' } };
      jest
        .spyOn(projectHandler['projectController'], 'getUserProjects')
        .mockResolvedValue(mockProjects as any);

      await projectHandler.getUserProjects(
        mockRequest as Request,
        mockResponse as Response,
        nextFunction
      );

      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith(mockProjects);
      expect(nextFunction).not.toHaveBeenCalled();
    });

    it('should call next with error when controller throws', async () => {
      mockRequest = { query: { userID: '5' } };
      const err = new Error('DB error');
      jest
        .spyOn(projectHandler['projectController'], 'getUserProjects')
        .mockRejectedValue(err);

      await projectHandler.getUserProjects(
        mockRequest as Request,
        mockResponse as Response,
        nextFunction
      );

      expect(nextFunction).toHaveBeenCalledWith(err);
    });
  });

  describe('addProject', () => {
    it('debe responder con 201 cuando se agrega un proyecto exitosamente', async () => {
      const input = {
        name: 'Proyecto X',
        description: 'Descripción',
        users: [{ userID: 1, projectRole: 'Owner' }]
      };
  
      const mockAddedProject = {
        project: { projectID: 123, name: input.name, description: input.description },
        assignedUsers: input.users,
      };
  
      mockRequest = { body: input };
  
      jest
        .spyOn(projectHandler['projectController'], 'addProject')
        .mockResolvedValue(mockAddedProject as any);
  
      await projectHandler.addProject(
        mockRequest as Request,
        mockResponse as Response,
        nextFunction
      );
  
      expect(mockResponse.status).toHaveBeenCalledWith(201);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'Project successfully added',
        addedProject: mockAddedProject,
      });
      expect(nextFunction).not.toHaveBeenCalled();
    });
    it('debe lanzar HttpException(400) si no se proporciona el nombre del proyecto', async () => {
      mockRequest = {
        body: {
          description: 'Proyecto sin nombre',
          users: [],
        },
      };
  
      await projectHandler.addProject(
        mockRequest as Request,
        mockResponse as Response,
        nextFunction
      );
  
      expect(nextFunction).toHaveBeenCalled();
      const err = nextFunction.mock.calls[0][0] as HttpException;
      expect(err).toBeInstanceOf(HttpException);
      expect(err.errorCode).toBe(400);
      expect(err.message).toBe('A name for the project is required');
    });
    it('debe llamar next(err) si el controller lanza un error', async () => {
      mockRequest = {
        body: {
          name: 'Proyecto Y',
          description: '',
          users: [],
        },
      };
  
      const err = new Error('Controller failed');
  
      jest
        .spyOn(projectHandler['projectController'], 'addProject')
        .mockRejectedValue(err);
  
      await projectHandler.addProject(
        mockRequest as Request,
        mockResponse as Response,
        nextFunction
      );
  
      expect(nextFunction).toHaveBeenCalledWith(err);
    });
  });   
  
  describe('deleteProject', () => {
    it('debe responder con 202 cuando el proyecto se elimina exitosamente', async () => {
      const projectID = 123;
      const mockDeleted = { projectID, name: 'Test', description: '', startDate: null, endDate: null};
  
      mockRequest = {
        params: { id: String(projectID) },
      };
  
      jest
        .spyOn(projectHandler['projectController'], 'deleteProject')
        .mockResolvedValue(mockDeleted);
  
      await projectHandler.deleteProject(
        mockRequest as Request,
        mockResponse as Response,
        nextFunction
      );
  
      expect(mockResponse.status).toHaveBeenCalledWith(202);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'Project successfully eliminated',
        deletedProject: mockDeleted,
      });
      expect(nextFunction).not.toHaveBeenCalled();
    });
    it('debe lanzar HttpException(400) si no se proporciona projectID', async () => {
      mockRequest = { params: {} };
  
      await projectHandler.deleteProject(
        mockRequest as Request,
        mockResponse as Response,
        nextFunction
      );
  
      expect(nextFunction).toHaveBeenCalled();
      const err = nextFunction.mock.calls[0][0] as HttpException;
      expect(err).toBeInstanceOf(HttpException);
      expect(err.errorCode).toBe(400);
      expect(err.message).toBe('Project ID is required');
    });
    it('debe llamar next(err) si el controller lanza un error', async () => {
      const projectID = 999;
      const err = new Error('Fallo interno');
  
      mockRequest = {
        params: { id: String(projectID) },
      };
  
      jest
        .spyOn(projectHandler['projectController'], 'deleteProject')
        .mockRejectedValue(err);
  
      await projectHandler.deleteProject(
        mockRequest as Request,
        mockResponse as Response,
        nextFunction
      );
  
      expect(nextFunction).toHaveBeenCalledWith(err);
    });
  });
  
  describe('updateProjectUsers', () => {
    it('debe responder con 200 cuando se actualizan los usuarios correctamente', async () => {
      const handler = new ProjectHandler();
  
      const projectID = 1;
      const body = {
        users: [
          { userID: 1, projectRole: 'Member' },
          { userID: 2, projectRole: 'Admin' }
        ]
      };
  
      const mockUpdatedUsers = [
        { userID: 1, projectID, projectRole: 'Member' },
        { userID: 2, projectID, projectRole: 'Admin' }
      ];
  
      mockRequest = {
        params: { id: String(projectID) },
        body
      };
  
      jest
        .spyOn(handler['projectController'], 'updateProjectUsers')
        .mockResolvedValue(mockUpdatedUsers);
  
      await handler.updateProjectUsers(
        mockRequest as Request,
        mockResponse as Response,
        nextFunction
      );
  
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: `Users of Project ID ${projectID} successfully updated`,
        users: mockUpdatedUsers
      });
      expect(nextFunction).not.toHaveBeenCalled();
    });
    it('debe llamar a next con HttpException si falta el ID del proyecto', async () => {
      const handler = new ProjectHandler();
  
      mockRequest = {
        params: {}, // falta id
        body: { users: [] }
      };
  
      await handler.updateProjectUsers(
        mockRequest as Request,
        mockResponse as Response,
        nextFunction
      );
  
      expect(nextFunction).toHaveBeenCalled();
      const error = nextFunction.mock.calls[0][0] as HttpException;
      expect(error).toBeInstanceOf(HttpException);
      expect(error.errorCode).toBe(400);
    });
    it('debe llamar a next(err) si el controller lanza un error', async () => {
      const handler = new ProjectHandler();
  
      const projectID = 2;
      mockRequest = {
        params: { id: String(projectID) },
        body: { users: [] }
      };
  
      const error = new Error('Service failure');
  
      jest
        .spyOn(handler['projectController'], 'updateProjectUsers')
        .mockRejectedValue(error);
  
      await handler.updateProjectUsers(
        mockRequest as Request,
        mockResponse as Response,
        nextFunction
      );
  
      expect(nextFunction).toHaveBeenCalledWith(error);
    });
  });      
});