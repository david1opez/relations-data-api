import { Router } from "express";
import { SendResponse, Error } from "../utils/utils";
import prisma from "../utils/Prisma";

import UserHandler from "../handlers/user";

const router = Router();

const userHandler = new UserHandler();

router.get("/users", userHandler.getAllUsers.bind(userHandler))
router.get("/users/:userID", userHandler.getUser.bind(userHandler))
router.post("/users", userHandler.createUser.bind(userHandler))
router.patch("/users/:userID", userHandler.updateUser.bind(userHandler)) 
router.delete("/users/:userID", userHandler.deleteUser.bind(userHandler))
router.post("/users/projects", userHandler.updateUserProjects.bind(userHandler))

router.get('/v2/users/', async (req, res) => {
    const { email } = req.query;

    if (!email) return Error(res, 400, 'Missing user email');

    try {
        const user = await prisma.user.findFirst({
            where: {
                email: String(email),
                uid: {
                    not: null,
                    notIn: [""]
                }
            }
        });

        if (!user) return Error(res, 404, 'User not found');

        SendResponse(res, 200, user);
    } catch (err) {
        Error(res, 500, err);
    }
});

router.post('/v2/users/assignUID', async (req, res) => {
    const { uid, email } = req.body;

    if (!uid || !email) return Error(res, 400, 'Missing uid or email');

    try {
        const user = await prisma.user.update({
            where: { email: String(email) },
            data: { uid: String(uid) },
        });

        SendResponse(res, 200, user);
    } catch (err) {
        if ((err as any)?.meta?.cause === 'No record was found for an update.') {
            return Error(res, 404, 'User not found');
        } else {
            Error(res, 500, err);
        }
    }
});

export default router;