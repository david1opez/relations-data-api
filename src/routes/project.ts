import { Router } from "express";

import ProjectHandler from "../handlers/project";

const router = Router();
const projectHandler = new ProjectHandler();

router.get("/projects", projectHandler.getAllProjects.bind(projectHandler));
router.get(
  "/user-projects",
  projectHandler.getUserProjects.bind(projectHandler)
);
router.post("/projects", projectHandler.addProject.bind(projectHandler));
router.delete("/projects/:id", projectHandler.deleteProject.bind(projectHandler));
router.patch("/projects/:id/users", projectHandler.updateProjectUsers.bind(projectHandler));

export default router;
