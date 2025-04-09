import UserController from "../controllers/user";
import HttpException from "../models/http-exception";
import {Request, Response, NextFunction} from "express";

class UserHandler{
    private userController: UserController;

    constructor() {
        this.userController = new UserController();
    }

    public async checkLogin(req: Request, res: Response, next: NextFunction) {
        try {
            const { userID, password } = req.body; 
            
            if (!userID || !password) {
                throw new HttpException(400, "User ID and password are required");
            }

            const userIDInt = parseInt(userID as string);
            if (isNaN(userIDInt)) {
                throw new HttpException(400, "User ID must be a number");
            }

            const passwordString = password.toString();
            if (passwordString.length === 0) {
                throw new HttpException(400, "Password cannot be empty");
            }

            const user = await this.userController.checkLogin(userIDInt, passwordString);
            res.status(200).json(user);
        } catch (err) {
        }
    }
}

export default UserHandler;