import { PrismaClient } from '@prisma/client/edge';

// HELPER FUNCTIONS
import { Error, SendResponse } from "../utils/express/utils";

// TYPES
import { Request, Response } from 'express';

const prisma = new PrismaClient();

export default async function getDetailsCall(req: Request, res: Response) {
    try {
        const { callID } = req.params; 

        if (!callID) {
            return Error(res, 400, "Call ID is required");
        }

        // Buscar la llamada con los atributos específicos
        const call = await prisma.call.findUnique({
            where: { callID: parseInt(callID) },
            select: {
                callID: true,
                title: true,
                startTime: true,
                endTime: true,
            }
        });

        if (!call) {
            return Error(res, 404, "Call not found");
        }

        SendResponse(res, 200, { call });
    } catch (err) {
        Error(res, 500, err);
    }
};
