import ProjectController from "../controllers/project";
import HttpException from "../models/http-exception";
import { Request, Response, NextFunction } from "express";

class ProjectHandler {
    private projectController: ProjectController;

    constructor() {
        this.projectController = new ProjectController();
    }

    public async getAllProjects(req: Request, res: Response, next: NextFunction) {
        try {
            const projects = await this.projectController.getAllProjects();
            res.status(200).json(projects);
        } catch (err) {
            next(err);
        }
    }

    public async getUserProjects(req: Request, res: Response, next: NextFunction) {
        try {
            const { userID } = req.query; 
            
            if (!userID) {
                throw new HttpException(400, "User ID is required");
            }

            const projects = await this.projectController.getUserProjects(parseInt(userID as string));
            res.status(200).json(projects);
        } catch (err) {
            next(err);
        }
    }
}

export default ProjectHandler;
