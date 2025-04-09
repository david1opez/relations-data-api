import { PrismaClient } from '@prisma/client'

// HELPER FUNCTIONS
import { Error, SendResponse } from "../utils/utils";

// TYPES
import { Request, Response } from 'express';

const prisma = new PrismaClient()

export default async function Home(req: Request, res: Response) {
    try {
        const users = await prisma.user.findMany();

        SendResponse(res, 200, { users });
    } catch (err) {
        Error(res, 500, err);
    }
};
