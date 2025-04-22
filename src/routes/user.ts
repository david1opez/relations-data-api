import { Router } from "express";

import UserHandler from "../handlers/user";
const router = Router();
const userHandler = new UserHandler();

router.get('/login', userHandler.checkLogin.bind(userHandler)); // /login?userID=1234&password=abcd

export default router;