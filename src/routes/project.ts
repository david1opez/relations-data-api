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

export default router;
