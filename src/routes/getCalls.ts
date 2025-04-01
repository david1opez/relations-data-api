import { PrismaClient } from '@prisma/client/edge';

// HELPER FUNCTIONS
import { Error, SendResponse } from "../utils/express/utils";

// TYPES
import { Request, Response } from 'express';

const prisma = new PrismaClient();

export default async function getCalls(req: Request, res: Response) {
    try {
        // Obtener todas las llamadas con los participantes internos y externos
        const calls = await prisma.call.findMany({
            select: {
                callID: true,
                title: true,
                startTime: true,
                endTime: true,
                summary: true,
                projectID: true,
                project: true, // Incluye el proyecto asociado a la llamada
                internalParticipants: {
                    select: {
                        user: {
                            select: {
                                userID: true,
                                name: true,
                                email: true
                            }
                        }
                    }
                },
                externalParticipants: {
                    select: {
                        client: {
                            select: {
                                email: true,
                                name: true,
                                organization: true
                            }
                        }
                    }
                },
                reportCalls: {
                    select: {
                        reportID: true,
                        callType: true,
                        startTime: true,
                        endTime: true
                    }
                }
            }
        });

        SendResponse(res, 200, { calls });
    } catch (err) {
        Error(res, 500, err);
    }
};
