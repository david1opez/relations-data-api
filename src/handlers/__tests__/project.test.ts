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
      // assert the exception’s HTTP code property (not `.status`)
      expect(calledWith.errorCode).toBe(400);
      expect(calledWith.message).toBe('User ID is required');
    });

    it('should return 200 with projects when userID is provided', async () => {
      const mockProjects = [
        { projectID: 10, name: 'Alpha', description: null },
        { projectID: 20, name: 'Beta',  description: 'Beta project' },
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
});