import ProjectController from "../controllers/project";
import HttpException from "../models/http-exception";
import { Request, Response, NextFunction } from "express";
import { CreateProjectDTO, UpdateProjectUsersDTO } from "../interfaces/projects";

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
            const {name, description = '', users} = req.body;
            const createProjectData: CreateProjectDTO = {
                name: name, 
                description: description,
                users: users
            }

            if(!name){
                throw new HttpException(400, "A name for the project is required")
            }
            const addedProject = await this.projectController.addProject(createProjectData)
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

            const deletedProject = await this.projectController.deleteProject(parseInt(projectID, 10));
            res.status(202).json({message: "Project successfully eliminated", deletedProject: deletedProject});
        } catch(err) {
            next(err);
        }
    }

    public async updateProjectUsers(req: Request, res: Response, next: NextFunction){
        try {
            const {users}  = req.body;
            const {id: notParsedProjectID} = req.params;
            const projectID = parseInt(notParsedProjectID, 10);
            const updateProjectUsersData: UpdateProjectUsersDTO = {projectID, users};

            const updatedProjectUsers = await this.projectController.updateProjectUsers(updateProjectUsersData);
            res.status(200).json({message: `Users of Project ID ${projectID} succesfully updated`, users: updatedProjectUsers});
        } catch(err){
            next(err);
        }
    }
}

export default ProjectHandler;
