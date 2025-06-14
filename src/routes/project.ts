import { Router } from "express";

import ProjectHandler from "../handlers/project";

const router = Router();
const projectHandler = new ProjectHandler();

router.get("/projects", projectHandler.getAllProjects.bind(projectHandler));
router.get("/projects/members-count", projectHandler.getMembersCount.bind(projectHandler));
router.get("/projects/:id/members-count", projectHandler.getProjectMembersCount.bind(projectHandler));
router.get("/user-projects", projectHandler.getUserProjects.bind(projectHandler));
router.get("/projects/:id", projectHandler.getProjectById.bind(projectHandler));
router.get("/projects/:id/users", projectHandler.getProjectUsers.bind(projectHandler));
router.post("/projects", projectHandler.addProject.bind(projectHandler));
router.patch("/projects/:id", projectHandler.updateProject.bind(projectHandler));
router.delete("/projects/:id", projectHandler.deleteProject.bind(projectHandler));
router.patch("/projects/:id/users", projectHandler.updateProjectUsers.bind(projectHandler));


export default router; 