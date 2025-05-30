import { Router } from "express";

import CallHandler from "../handlers/call";
const router = Router();
const callHandler = new CallHandler();

router.get('/calls', callHandler.getAllCalls.bind(callHandler)); // /calls?projectID=1234
router.get('/details', callHandler.getCall.bind(callHandler)); // /details?callID=1234
router.delete('/delete', callHandler.deleteCall.bind(callHandler)); // /delete?callID=1234
router.patch('/markAnalyzed', callHandler.markCallAsAnalyzed.bind(callHandler));
router.post('/add', callHandler.addCall.bind(callHandler)); // POST /add with body containing projectID, title, startTime, endTime
router.get('/history', callHandler.getCallHistory.bind(callHandler)); // /history?projectID=1234&interval=daily|weekly|monthly&userID=1234

export default router;
