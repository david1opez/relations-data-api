import HttpException from '../models/http-exception';
import ProjectService from '../services/project';
import { CreateProjectDTO, UpdateProjectUsersDTO } from '../interfaces/projects';
import { PrismaClient } from "@prisma/client"

class ProjectController {
    private projectService: ProjectService;
    private prisma: PrismaClient;

    constructor() {
        this.projectService = new ProjectService();
        this.prisma = new PrismaClient();
    }

    async getAllProjects() {
        try {
            const projects = await this.projectService.getAllProjects();
            return projects;
        } catch (err) {
            throw new Error("Error fetching projects: " + err);
        }
    }

    async getProjectById(projectID: number) {
        try {
            const project = await this.projectService.getProjectById(projectID);
            return project;
        } catch (err) {
            throw new HttpException(500, "Error fetching project: " + err);
        }
    }

    async getUserProjects(userID: number) {
        try {
            const projects = await this.projectService.getUserProjects(userID);
            return projects;
        } catch (err) {
            throw new Error("Error fetching user projects: " + err);
        }
    }

    async addProject(createProjectData: CreateProjectDTO ){
        try {
            const addedProject = await this.projectService.addProject(createProjectData)
            return addedProject;
        } catch (err) {
            if (err instanceof HttpException){
                throw err;
            }
            throw new HttpException(500, "Error adding project: " + err);
        }
    }

    async deleteProject(projectID: number){
        try {
            const deletedProject = await this.projectService.deleteProject(projectID);
            return deletedProject;
        } catch (err) {

            if(err instanceof HttpException){
                throw err;
            }
            throw new HttpException(500, "Error deleting project: " + err);
        }
    }

    async updateProjectUsers(newProjectUsersData: UpdateProjectUsersDTO){

        try {
            const updatedProjectUsers = await this.projectService.updateProjectUsers(newProjectUsersData);
            return updatedProjectUsers;
        } catch (err){
            if(err instanceof HttpException){
                throw err;
            }
            throw new HttpException(500, "Error updating project users: " + err);
        }
    }

    public async getMembersCount() {
        try {
            type MemberCount = {
                projectID: number;
                count: string;
            };

            // Obtener el conteo de miembros por proyecto usando Prisma
            const memberCounts = await this.prisma.$queryRaw<MemberCount[]>`
                SELECT p."projectID", COUNT(up."userID") as count
                FROM "Project" p
                LEFT JOIN "UserProject" up ON p."projectID" = up."projectID"
                GROUP BY p."projectID"
                ORDER BY p."projectID"
            `;

            // Transformar el resultado a un objeto { projectID: count }
            const countsByProject = memberCounts.reduce((acc: Record<number, number>, curr: MemberCount) => ({
                ...acc,
                [curr.projectID]: Number(curr.count)
            }), {});

            return countsByProject;
        } catch (error) {
            throw new HttpException(500, "Error getting member counts");
        }
    }
}

export default ProjectController;




    