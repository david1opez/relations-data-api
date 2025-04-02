import { PrismaClient } from '@prisma/client';

// HELPER FUNCTIONS
import { Error, SendResponse } from "../utils/express/utils";

// TYPES
import { Request, Response } from 'express';

const prisma = new PrismaClient();

export default async function getCall(req: Request, res: Response) {
    try {
        const { callID } = req.query; 
        console.log("Call ID:", callID); // Debugging line
        
        if (!callID) {
            return Error(res, 400, "Call ID is required");
        }

        const call = await prisma.call.findUnique({
            where: { callID: parseInt(callID as string) },
            include: {
                internalParticipants: {
                    include: {
                        user: true, // Include user details for internal participants
                    },
                },
                externalParticipants: {
                    include: {
                        client: true, // Include client details for external participants
                    },
                },
            },
        });

        if (!call) {
            return Error(res, 404, "Call not found");
        }

        SendResponse(res, 200, { call });
    } catch (err) {
        console.error("Error fetching call:", err); // Log the error for debugging
        Error(res, 500, "An error occurred while fetching the call");
    }
}