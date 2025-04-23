import prisma from "../../client";
import HttpException from "../models/http-exception";

class ProjectService {
    async getAllProjects() {
        try {
            const projects = await prisma.project.findMany();
            return projects;
        } catch (err) {
            if (err instanceof HttpException) {
                throw err;
            }
            throw new HttpException(500, "Error fetching projects" + err);
        }
    }

    async getUserProjects(userID: number) {
        try {
            const userProjects = await prisma.userProject.findMany({
                where: { userID: userID },
                include: {
                    project: true, // Include project details
                },
            });

            const projects = userProjects.map(up => up.project);

            return projects;
        } catch (err) {
            if (err instanceof HttpException) {
                throw err;
            }
            throw new HttpException(500, "Error fetching user projects" + err);
        }
    }

    async addProject(name: string, description: string | undefined) {
        try {
          const project = await prisma.project.create({
            data: {
              name,
              description,
            },
          });

          return project;
        } catch (err) {
          if (err instanceof HttpException) {
            throw err;
          }
          console.error("Error in addProject service:", err);
          throw new HttpException(500, "Error adding project: " + err);
        }
    }

    async deleteProject(projectID: number){
        try{
            const project = await prisma.project.findUnique({where: {projectID: projectID}});
            
            if(!project){
                throw new HttpException(404, `Project with ID ${projectID} not found`);
            }

            const deletedProject = await prisma.project.delete({where: {projectID: projectID}});
            
            return deletedProject;
        } catch(err) {
            if (err instanceof HttpException) {
                throw err;
            }
            console.error("Error in deleteProject service: ", err);
            throw new HttpException(500, "Error deleting project: " + err);
        }
    }
}

export default ProjectService;