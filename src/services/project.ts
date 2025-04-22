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
}

export default ProjectService;