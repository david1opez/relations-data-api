import UserHandler from '../user';
import UserController from '../../controllers/user';
import HttpException from '../../models/http-exception';
import { Request, Response } from 'express';

jest.mock('../../controllers/user');

describe('UserHandler', () => {
    let userHandler: UserHandler;
    let mockRequest: Partial<Request>;
    let mockResponse: Partial<Response>;
    let nextFunction: jest.Mock;

    beforeEach(() => {
        userHandler = new UserHandler();
        mockResponse = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };
        nextFunction = jest.fn();
    });

    describe('checkLogin', () => {
        it('should return 400 when userID or password is missing', async () => {
            mockRequest = {
                body: { userID: '', password: '' }
            };

            await userHandler.checkLogin(
                mockRequest as Request,
                mockResponse as Response,
                nextFunction
            );

            expect(nextFunction).toHaveBeenCalledWith(expect.any(HttpException));
        });

        it('should return 400 when userID is not a number', async () => {
            mockRequest = {
                body: { userID: 'abc', password: 'secret' }
            };

            await userHandler.checkLogin(
                mockRequest as Request,
                mockResponse as Response,
                nextFunction
            );

            expect(nextFunction).toHaveBeenCalledWith(expect.any(HttpException));
        });

        it('should return 400 when password is empty', async () => {
            mockRequest = {
                body: { userID: '123', password: '' }
            };

            await userHandler.checkLogin(
                mockRequest as Request,
                mockResponse as Response,
                nextFunction
            );

            expect(nextFunction).toHaveBeenCalledWith(expect.any(HttpException));
        });

        it('should return 200 and user data when login is successful', async () => {
            const mockUser = { id: 123, name: 'Test User' };
            (UserController.prototype.checkLogin as jest.Mock).mockResolvedValue(mockUser);

            mockRequest = {
                body: { userID: '123', password: 'secret' }
            };

            await userHandler.checkLogin(
                mockRequest as Request,
                mockResponse as Response,
                nextFunction
            );

            expect(mockResponse.status).toHaveBeenCalledWith(200);
            expect(mockResponse.json).toHaveBeenCalledWith(mockUser);
        });

        it('should call next with error if controller throws', async () => {
            const mockError = new Error('Internal Error');
            (UserController.prototype.checkLogin as jest.Mock).mockRejectedValue(mockError);

            mockRequest = {
                body: { userID: '123', password: 'secret' }
            };

            await userHandler.checkLogin(
                mockRequest as Request,
                mockResponse as Response,
                nextFunction
            );

            expect(nextFunction).toHaveBeenCalledWith(mockError);
        });
    });
});
