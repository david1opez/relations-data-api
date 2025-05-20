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
});