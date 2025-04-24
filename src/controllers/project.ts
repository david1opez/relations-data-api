import HttpException from '../models/http-exception';
import ProjectService from '../services/project';
import { CreateProjectDTO, UpdateProjectUsersDTO } from '../interfaces/projects';

class ProjectController {
    private projectService: ProjectService;

    constructor() {
        this.projectService = new ProjectService();
    }

    async getAllProjects() {
        try {
            const projects = await this.projectService.getAllProjects();
            return projects;
        } catch (err) {
            throw new Error("Error fetching projects: " + err);
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
}

export default ProjectController;




    