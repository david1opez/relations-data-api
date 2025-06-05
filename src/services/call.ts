import prisma from "../../client";
import HttpException from "../models/http-exception";

class CallService {
    async getAllCalls(projectID: number) {
        try {
            const calls = await prisma.call.findMany({
                where: { projectID: projectID },
                include: {
                    internalParticipants: {
                        include: {
                            user: true,
                        },
                    },
                    externalParticipants: {
                        include: {
                            client: true,
                        },
                    },
                },
                omit: {
                    summary: false,
                    projectID: true,
                },
            });
    
            return calls;
        } catch (err) {
            if (err instanceof HttpException) {
                throw err;
            }
            throw new HttpException(500, "Error fetching calls" + err);
        }
    }
    
    async getCall(callID: number) {
        try {        
            const call = await prisma.call.findUnique({
                where: { callID: callID },
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
                throw new HttpException(404, "Call not found");
            }
    
            return call;
    
        } catch (err) {
            if (err instanceof HttpException) {
                throw err;
            }
            throw new HttpException(500, "An error occurred while fetching the call" + err);
        }
    }

    async deleteCall(callID: number) {
        try {
            // check if call exists
            const call = await prisma.call.findUnique({
                where: { callID: callID }
            });

            if (!call) {
                throw new HttpException(404, "Call not found");
            }

            // Delete the call
            await prisma.call.delete({
                where: { callID: callID }
            });

            return { message: "Call deleted successfully" };
        } catch (err) {
            if (err instanceof HttpException) {
                throw err;
            }
            throw new HttpException(500, "An error occurred while deleting the call: " + err);
        }
    }

    async markCallAsAnalyzed(callID: number) {
    try {
        const call = await prisma.call.findUnique({ where: { callID } });

        if (!call) {
            throw new HttpException(404, "Call not found");
        }

        const updatedCall = await prisma.call.update({
            where: { callID },
            data: {
                isAnalyzed: true,
            },
        });

        return { message: "Call marked as analyzed", call: updatedCall };
    } catch (err) {
        if (err instanceof HttpException) {
            throw err;
        }
        throw new HttpException(500, "An error occurred while updating the call: " + err);
    }
}

    async addCall(
        projectID: number, 
        title: string | null, 
        startTime: Date | null, 
        endTime: Date | null, 
        summary: string | null,
        internalParticipants: number[] = [], // Array of userIDs
        externalParticipants: string[] = []  // Array of client emails
    ) {
        try {
            // Check if project exists
            const project = await prisma.project.findUnique({
                where: { projectID }
            });

            if (!project) {
                throw new HttpException(404, "Project not found");
            }

            // Create the call with participants in a transaction
            const call = await prisma.$transaction(async (tx) => {
                // Create the call
                const newCall = await tx.call.create({
                    data: {
                        projectID,
                        title,
                        startTime,
                        endTime,
                        summary,
                        isAnalyzed: false,
                        // Create internal participants if any
                        internalParticipants: internalParticipants.length > 0 ? {
                            create: internalParticipants.map(userID => ({
                                userID
                            }))
                        } : undefined,
                        // Create external participants if any
                        externalParticipants: externalParticipants.length > 0 ? {
                            create: externalParticipants.map(clientEmail => ({
                                clientEmail
                            }))
                        } : undefined
                    },
                    include: {
                        internalParticipants: {
                            include: {
                                user: true
                            }
                        },
                        externalParticipants: {
                            include: {
                                client: true
                            }
                        }
                    }
                });

                return newCall;
            });

            return call;
        } catch (err) {
            if (err instanceof HttpException) {
                throw err;
            }
            // Handle potential foreign key constraint errors
            if (err && typeof err === 'object' && 'code' in err && err.code === 'P2003') {
                throw new HttpException(400, "Invalid participant ID or email provided");
            }
            throw new HttpException(500, "An error occurred while creating the call: " + err);
        }
    }

    async getCallHistory(projectID: number, userID?: number) {
        try {
            // Get all analyzed calls for the project
            const calls = await prisma.call.findMany({
                where: { 
                    projectID: projectID,
                    isAnalyzed: true,
                    ...(userID ? {
                        internalParticipants: {
                            some: {
                                userID: userID
                            }
                        }
                    } : {})
                },
                select: {
                    callID: true,
                    startTime: true,
                    endTime: true
                },
                orderBy: {
                    startTime: 'asc'
                }
            });

            if (calls.length === 0) {
                return [];
            }

            // Construct the API URL with callIDs
            const callIds = calls.map(call => call.callID).join(',');
            const apiUrl = `https://x5fruv6w29.execute-api.us-east-2.amazonaws.com/analysis?callID=${callIds}`;
            
            // Make the API call
            const response = await fetch(apiUrl);
            if (!response.ok) {
                throw new HttpException(response.status, `API call failed: ${response.statusText}`);
            }

            const data = await response.json();
            
            // Create a map of callID to analysis results for easy lookup
            const analysisMap = new Map(
                data.results.map((result: any) => [result.callID, result.resultado])
            );

            // Return combined data
            return calls.map(call => ({
                ...call,
                analysis: analysisMap.get(call.callID) || null
            }));
        } catch (err) {
            if (err instanceof HttpException) {
                throw err;
            }
            throw new HttpException(500, "Error fetching call history: " + err);
        }
    }
}

export default CallService


