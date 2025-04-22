import UserService from "../services/user";

class UserController {
    private userService: UserService;

    constructor() {
        this.userService = new UserService();
    }

    async checkLogin(userID: number, password: string) {
        try {
            const user = await this.userService.checkLogin(userID, password);
            return user;
        } catch (err) {
            throw new Error("Error checking login: " + err);
        }
    }
}

export default UserController;