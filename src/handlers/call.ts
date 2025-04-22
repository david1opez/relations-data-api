import CallController from "../controllers/call";
import HttpException from "../models/http-exception";
import {Request, Response, NextFunction} from "express";

class CallHandler {
    private callController: CallController;

    constructor() {
        this.callController = new CallController();
    }

    public async getAllCalls(req: Request, res: Response, next: NextFunction) {
        try {
            const { projectID } = req.query; 
            
            if (!projectID) {
                throw new HttpException(400, "Project ID is required");
            }

            const calls = await this.callController.getAllCalls(parseInt(projectID as string));
            res.status(200).json(calls);
        } catch (err) {
            next(err);
        }
    }

    public async getCall(req: Request, res: Response, next: NextFunction) {
        try {
            const { callID } = req.query; 
            
            if (!callID) {
                throw new HttpException(400, "Call ID is required");
            }

            const call = await this.callController.getCall(parseInt(callID as string));
            res.status(200).json(call);
        } catch (err) {
            next(err);
        }
    }
}

export default CallHandler;

