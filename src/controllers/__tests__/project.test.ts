import ProjectController from '../project';
import { prismaMock } from '../../../tests/prismaTestClient';

describe('ProjectController', () => {
    let projectController: ProjectController;

    beforeEach(() => {
        projectController = new ProjectController();
    });

    describe('getAllProjects', () => {
        it('should return all projects', async () => {
            const mockProjects = [
                { projectID: 1, name: 'Project 1', description: 'Test project 1' },
                { projectID: 2, name: 'Project 2', description: 'Test project 2' }
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
                    project: { projectID: 1, name: 'Project 1', description: 'Test project 1' }
                },
                {
                    userID: 1,
                    projectID: 2,
                    projectRole: null,
                    project: { projectID: 2, name: 'Project 2', description: 'Test project 2' }
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
});