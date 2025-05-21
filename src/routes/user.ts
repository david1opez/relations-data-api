import { Router } from "express";

import UserHandler from "../handlers/user";
const router = Router();
const userHandler = new UserHandler();

router.get('/login', userHandler.checkLogin.bind(userHandler)); // /login?userID=1234&password=abcd
router.get("/users", userHandler.getAllUsers.bind(userHandler))
router.get("/users/:userID", userHandler.getUser.bind(userHandler))
router.post("/users", userHandler.createUser.bind(userHandler))
router.patch("/users/:userID", userHandler.updateUser.bind(userHandler)) 
router.delete("/users/:userID", userHandler.deleteUser.bind(userHandler))
router.post("/users/projects", userHandler.updateUserProjects.bind(userHandler))

export default router;