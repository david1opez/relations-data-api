import { Router } from "express";

import CallHandler from "../handlers/call";
const router = Router();
const callHandler = new CallHandler();

router.get('/calls', callHandler.getAllCalls.bind(callHandler)); // /calls?projectID=1234
router.get('/details', callHandler.getCall.bind(callHandler)); // /details?callID=1234

export default router;
/*
export async function setCall(req: Request, res: Response) {
    try {
        const callData : Call = req.body;

        if (!callData) {
            return Error(res, 400, "Call data is required");
        }

        let call;
        if (callData.callID) {
            call = await prisma.call.update({
                where: { 
                    callID: callData.callID
                },
                data: {
                    ...callData
                }
            });
        } else {
            // Create new call
            call = await prisma.call.create({
                data: {
                    ...callData
                }
            });
        }

        SendResponse(res, 200, { call });
    } catch (err) {
        Error(res, 500, err);
    }
}
*/