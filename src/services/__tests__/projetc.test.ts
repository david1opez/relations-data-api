// service/test/project.test.ts

import ProjectService from '../project';
import { prismaMock } from '../../../tests/prismaTestClient';
import HttpException from '../../models/http-exception';

describe('ProjectService', () => {
  let projectService: ProjectService;

  beforeEach(() => {
    projectService = new ProjectService();
  });

  describe('getAllProjects', () => {
    it('should return all projects', async () => {
      const mockProjects = [
        { projectID: 1, name: 'Proyecto A' },
        { projectID: 2, name: 'Proyecto B' },
      ];
      prismaMock.project.findMany.mockResolvedValue(mockProjects);

      const result = await projectService.getAllProjects();
      expect(result).toEqual(mockProjects);
    });

    it('should throw HttpException when database query fails', async () => {
      prismaMock.project.findMany.mockRejectedValue(new Error('DB error'));

      await expect(projectService.getAllProjects())
        .rejects
        .toThrow(HttpException);
    });
  });

  describe('getUserProjects', () => {
    it('should return only the projects for a given user', async () => {
      const mockUserProjects = [
        { userID: 42, projectID: 1, project: { projectID: 1, name: 'Alpha' } },
        { userID: 42, projectID: 2, project: { projectID: 2, name: 'Beta' } },
      ];
      prismaMock.userProject.findMany.mockResolvedValue(mockUserProjects);

      const result = await projectService.getUserProjects(42);
      expect(result).toEqual([
        { projectID: 1, name: 'Alpha' },
        { projectID: 2, name: 'Beta' },
      ]);
    });

    it('should throw HttpException when database query fails', async () => {
      prismaMock.userProject.findMany.mockRejectedValue(new Error('DB error'));

      await expect(projectService.getUserProjects(42))
        .rejects
        .toThrow(HttpException);
    });
  });
});