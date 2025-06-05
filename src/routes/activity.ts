import { Router } from "express"
import prisma from "../utils/Prisma";
import { Error, SendResponse } from "../utils/utils"; 

const router = Router()


router.get('/recent', async (req, res) => {
    const { uid } = req.query;

    if (!uid) return Error(res, 400, 'Missing uid');

    try {
        // Get user
        const user = await prisma.user.findUnique({
            where: { uid: String(uid) },
            select: { userID: true, name: true }
        });

        if (!user) return Error(res, 404, 'User not found');

        // Get all projectIDs where user is a member
        const userProjects = await prisma.userProject.findMany({
            where: { userID: user.userID },
            select: { projectID: true }
        });
        const projectIDs = userProjects.map(up => up.projectID);

        // Get all callIDs where user is a participant
        const callParticipants = await prisma.internalCallParticipants.findMany({
            where: { userID: user.userID },
            select: { callID: true }
        });
        const callIDs = callParticipants.map(cp => cp.callID);

        // Get activity logs matching any of the criteria
        const activityLogs = await prisma.activityLog.findMany({
            where: {
                OR: [
                    { userID: user.userID },
                    { projectID: { in: projectIDs.length > 0 ? projectIDs : [0] } },
                    { callID: { in: callIDs.length > 0 ? callIDs : [0] } }
                ]
            },
            orderBy: { timestamp: 'desc' },
            include: {
                user: { select: { name: true } },
                project: { select: { name: true } },
                call: { select: { title: true, callID: true } }
            }
        });

        // Format activities
        const activities = activityLogs.map(log => {
            let where = null;
            if (log.project) {
                where = log.project.name;
            } else if (log.call) {
                where = log.call.title || `call_${log.call.callID}`;
            }
            return {
                username: log.user.name,
                date: log.timestamp,
                action: log.action,
                where
            };
        });

        return SendResponse(res, 200, { activities });
    } catch (err) {
        Error(res, 500, err);
    }
});

router.post('/log', async (req, res) => {
    const { uid, action } = req.body;
    const projectID = req.body.projectID || null;
    const callID = req.body.callID || null;

    if (!uid || !action) return Error(res, 400, 'Missing uid or action');

    try {
        const user = await prisma.user.findUnique({
            where: { uid: String(uid) },
            select: { userID: true }
        });

        if (!user) return Error(res, 404, 'User not found');

        const activityLog = await prisma.activityLog.create({
            data: {
                userID: user.userID,
                action,
                projectID: projectID ? Number(projectID) : null,
                callID: callID ? Number(callID) : null,
                timestamp: new Date()
            }
        });

        return SendResponse(res, 201, activityLog);
    } catch (err) {
        Error(res, 500, err);
    }
})

export default router;
