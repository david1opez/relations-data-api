import { PrismaClient } from '@prisma/client';

// HELPER FUNCTIONS
import { Error, SendResponse } from "../utils/express/utils";

// TYPES
import { Request, Response } from 'express';

const prisma = new PrismaClient();

export default async function getAllProjects(req: Request, res: Response) {
    try {
        const projects = await prisma.project.findMany();

        SendResponse(res, 200, { projects });
    } catch (err) {
        Error(res, 500, err);
    }
};
