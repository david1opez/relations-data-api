import prisma from "../../client";
import HttpException from "../models/http-exception";

class UserService{
    async checkLogin(userID: number, password: string) {
        try {
            const user = await prisma.user.findUnique({
                where: { userID: userID },
            });
            if (!user) {
                throw new HttpException(404, "User not found");
            }
            if (user.password !== password) {
                throw new HttpException(401, "Invalid password");
            }
            return user;
        } catch (err) {
            if (err instanceof HttpException) {
                throw err;
            }
            throw new Error(`Error checking login: ${err}`);
        }
    }
}

export default UserService;