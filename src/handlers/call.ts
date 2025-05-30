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

    public async deleteCall(req: Request, res: Response, next: NextFunction) {
        try {
            const { callID } = req.query;
            
            if (!callID) {
                throw new HttpException(400, "Call ID is required");
            }

            const result = await this.callController.deleteCall(parseInt(callID as string));
            res.status(200).json(result);
        } catch (err) {
            next(err);
        }
    }

    public async markCallAsAnalyzed(req: Request, res: Response, next: NextFunction) {
    try {
        const { callID } = req.body;

        if (!callID) {
            throw new HttpException(400, "Call ID is required");
        }

        const result = await this.callController.markCallAsAnalyzed(callID);
        res.status(200).json(result);
    } catch (err) {
        next(err);
    }
}

    public async addCall(req: Request, res: Response, next: NextFunction) {
        try {
            const { 
                projectID, 
                title, 
                startTime, 
                endTime, 
                summary,
                internalParticipants = [],
                externalParticipants = []
            } = req.body;

            if (!projectID) {
                throw new HttpException(400, "Project ID is required");
            }

            // Validate participants arrays
            if (!Array.isArray(internalParticipants)) {
                throw new HttpException(400, "Internal participants must be an array of user IDs");
            }
            if (!Array.isArray(externalParticipants)) {
                throw new HttpException(400, "External participants must be an array of client emails");
            }

            // Convert dates if provided
            const parsedStartTime = startTime ? new Date(startTime) : null;
            const parsedEndTime = endTime ? new Date(endTime) : null;

            const call = await this.callController.addCall(
                parseInt(projectID as string),
                title || null,
                parsedStartTime,
                parsedEndTime,
                summary || null,
                internalParticipants.map(id => parseInt(id as string)),
                externalParticipants
            );

            res.status(201).json(call);
        } catch (err) {
            next(err);
        }
    }

    public async getCallHistory(req: Request, res: Response, next: NextFunction) {
        try {
            const { projectID, interval, userID } = req.query;
            
            if (!projectID) {
                throw new HttpException(400, "Project ID is required");
            }

            if (!interval || !['daily', 'weekly', 'monthly'].includes(interval as string)) {
                throw new HttpException(400, "Valid interval (daily, weekly, or monthly) is required");
            }

            const history = await this.callController.getCallHistory(
                parseInt(projectID as string),
                interval as 'daily' | 'weekly' | 'monthly',
                userID ? parseInt(userID as string) : undefined
            );

            res.status(200).json(history);
        } catch (err) {
            next(err);
        }
    }

}

export default CallHandler;

