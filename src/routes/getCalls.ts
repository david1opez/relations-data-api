import { PrismaClient } from '@prisma/client';

// HELPER FUNCTIONS
import { Error, SendResponse } from "../utils/express/utils";

// TYPES
import { Request, Response } from 'express';

const prisma = new PrismaClient();

export default async function getCalls(req: Request, res: Response) {
    try {
        const { projectID } = req.query; 
        console.log("Project ID:", projectID); // Debugging line
        
        if (!projectID) {
            return Error(res, 400, "Project ID is required");
        }

        const calls = await prisma.call.findMany({
            // Return all info except for the transcript
            where: { projectID: parseInt(projectID as string) },
            omit: {
                summary: true, 
                projectID: true,
            },
        });

        SendResponse(res, 200, { calls });
    } catch (err) {
        Error(res, 500, err);
    }
};