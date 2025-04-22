import UserController from '../user';
import UserService from '../../services/user';

jest.mock('../../services/user');

describe('UserController', () => {
    let userController: UserController;
    let mockUserService: jest.Mocked<UserService>;

    beforeEach(() => {
        mockUserService = new UserService() as jest.Mocked<UserService>;
        userController = new UserController();
        (userController as any).userService = mockUserService; // Inject mocked service
    });

    describe('checkLogin', () => {
        it('should return user data when login is successful', async () => {
            const mockUser = {
                userID: 1,
                name: 'Test User',
                email: 'test@example.com',
                password: null,
                role: null,
                departmentID: null,
            };
            mockUserService.checkLogin.mockResolvedValue(mockUser);

            const result = await userController.checkLogin(1, 'password123');

            expect(result).toEqual(mockUser);
            expect(mockUserService.checkLogin).toHaveBeenCalledWith(1, 'password123');
        });

        it('should throw an error when user is not found', async () => {
            mockUserService.checkLogin.mockRejectedValue(new Error('User not found'));

            await expect(userController.checkLogin(999, 'password123')).rejects.toThrow('Error checking login: Error: User not found');
        });

        it('should throw an error when password is invalid', async () => {
            mockUserService.checkLogin.mockRejectedValue(new Error('Invalid password'));

            await expect(userController.checkLogin(1, 'wrongpassword')).rejects.toThrow('Error checking login: Error: Invalid password');
        });

        it('should throw an error when service fails', async () => {
            mockUserService.checkLogin.mockRejectedValue(new Error('Service error'));

            await expect(userController.checkLogin(1, 'password123')).rejects.toThrow('Error checking login: Error: Service error');
        });
    });
});



