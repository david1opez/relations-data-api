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

    public async addProject(req: Request, res: Response, next: NextFunction){
        try {
            const {name, description = ''} = req.body;

            if(!name){
                throw new HttpException(400, "A name for the project is required")
            }
            const addedProject = await this.projectController.addProject(name, description)
            res.status(201).json({message: "Project successfully added", addedProject: addedProject})

        } catch(err) {
            next(err);
        }
    }

    public async deleteProject(req: Request, res: Response, next: NextFunction){
        try {
            const {id: projectID} = req.params;

            if(!projectID){
                throw new HttpException(400, "Project ID is required")
            }

            const deletedProject = await this.projectController.deleteProject(parseInt(projectID));
            res.status(202).json({message: "Project successfully eliminated", deletedProject: deletedProject});
        } catch(err) {
            next(err);
        }
    }
}

export default ProjectHandler;
