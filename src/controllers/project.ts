import ProjectService from '../services/project';

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
}

export default ProjectController;




    