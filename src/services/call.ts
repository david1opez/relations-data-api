import prisma from "../../client";
import HttpException from "../models/http-exception";

class CallService {
    async getAllCalls(projectID: number) {
        try {
            const calls = await prisma.call.findMany({
                // Return all info except for the transcript
                where: { projectID: projectID },
                omit: {
                    summary: true, 
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
}

export default CallService


