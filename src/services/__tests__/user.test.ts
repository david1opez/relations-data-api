import UserService from '../user';
import { prismaMock } from '../../../tests/prismaTestClient';
import HttpException from '../../models/http-exception';


describe("UserService", () => {
    let userService: UserService;
  
    beforeEach(() => {
      userService = new UserService();
    });
  
    afterEach(() => {
      jest.clearAllMocks();
    });
  
    test("should return user if login is successful", async () => {
      const mockUser = { userID: 1, password: "secret" };
      (prismaMock.user.findUnique as jest.Mock).mockResolvedValue(mockUser);
  
      const result = await userService.checkLogin(1, "secret");
  
      expect(result).toEqual(mockUser);
      expect(prismaMock.user.findUnique).toHaveBeenCalledWith({ where: { userID: 1 } });
    });
  
    test("should throw HttpException with errorCode 404 when user is not found", async () => {
      (prismaMock.user.findUnique as jest.Mock).mockResolvedValue(null);
  
      await expect(userService.checkLogin(2, "anypass")).rejects.toMatchObject({
        errorCode: 404,
        message: "User not found"
      });
    });
  
    test("should throw HttpException with errorCode 401 for invalid password", async () => {
      const mockUser = { userID: 1, password: "secret" };
      (prismaMock.user.findUnique as jest.Mock).mockResolvedValue(mockUser);
  
      await expect(userService.checkLogin(1, "wrongpass")).rejects.toMatchObject({
        errorCode: 401,
        message: "Invalid password"
      });
    });
  
    test("should throw HttpException with errorCode 500 when prisma.findUnique fails", async () => {
      const errorMsg = "database error";
      (prismaMock.user.findUnique as jest.Mock).mockRejectedValue(new Error(errorMsg));
  
      await expect(userService.checkLogin(1, "secret")).rejects.toThrow(`Error checking login: Error: ${errorMsg}`);
    });
  });
