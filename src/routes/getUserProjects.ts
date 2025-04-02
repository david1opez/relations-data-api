import { PrismaClient } from '@prisma/client';

// HELPER FUNCTIONS
import { Error, SendResponse } from "../utils/express/utils";

// TYPES
import { Request, Response } from 'express';

const prisma = new PrismaClient();

export default async function getUserProjects(req: Request, res: Response) {
    try {
        const { userID } = req.params; 
        
        if (!userID) {
            return Error(res, 400, "User ID is required");
        }

        const userProjects = await prisma.userProject.findMany({
            where: { userID: parseInt(userID) },
            include: {
                project: true // Inclde project details
            }
        });

        const projects = userProjects.map(up => up.project);

        SendResponse(res, 200, { projects });
    } catch (err) {
        Error(res, 500, err);
    }
};
