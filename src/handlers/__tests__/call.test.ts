import CallHandler from '../call';
import { Request, Response } from 'express';
import HttpException from '../../models/http-exception';

describe('CallHandler', () => {
    let callHandler: CallHandler;
    let mockRequest: Partial<Request>;
    let mockResponse: Partial<Response>;
    let nextFunction: jest.Mock;

    beforeEach(() => {
        callHandler = new CallHandler();
        mockResponse = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };
        nextFunction = jest.fn();
    });

    describe('getAllCalls', () => {
        it('should return 400 when projectID is missing', async () => {
            mockRequest = {
                query: {}
            };

            await callHandler.getAllCalls(
                mockRequest as Request,
                mockResponse as Response,
                nextFunction
            );

            expect(nextFunction).toHaveBeenCalledWith(
                expect.objectContaining({
                    errorCode: 400,
                    message: 'Project ID is required'
                })
            );
        });

        it('should return 200 with calls when successful', async () => {
            mockRequest = {
                query: { projectID: '1' }
            };

            const mockCalls = [
                { callID: 1, title: 'Call 1', startTime: null, endTime: null, analyzed: false },
                { callID: 2, title: 'Call 2', startTime: null, endTime: null, analyzed: false }
            ];

            jest.spyOn(callHandler['callController'], 'getAllCalls')
                .mockResolvedValue(mockCalls);

            await callHandler.getAllCalls(
                mockRequest as Request,
                mockResponse as Response,
                nextFunction
            );

            expect(mockResponse.status).toHaveBeenCalledWith(200);
            expect(mockResponse.json).toHaveBeenCalledWith(mockCalls);
        });
    });

    describe('getCall', () => {
        it('should return 400 when callID is missing', async () => {
            mockRequest = {
                query: {}
            };

            await callHandler.getCall(
                mockRequest as Request,
                mockResponse as Response,
                nextFunction
            );

            expect(nextFunction).toHaveBeenCalledWith(
                expect.objectContaining({
                    errorCode: 400,
                    message: 'Call ID is required'
                })
            );
        });

        it('should return 200 with call details when successful', async () => {
            mockRequest = {
                query: { callID: '1' }
            };

            const mockCall = {
                callID: 1,
                title: 'Test Call',
                summary: 'Test summary',
                startTime: null,
                endTime: null,
                projectID: 101,
                analyzed: false,
                internalParticipants: [
                    {
                        user: {
                            name: 'John Doe',
                            userID: 1,
                            email: 'john.doe@example.com',
                            role: 'Manager' as string | null,
                            departmentID: 101 as number | null,
                            password: null,
                            profilePicture: null
                        },
                        callID: 1,
                        userID: 1
                    }
                ],
                externalParticipants: [
                    {
                        client: {
                            name: 'Jane Smith',
                            email: 'jane.smith@example.com',
                            organization: 'External Org',
                            description: null
                        },
                        callID: 1,
                        clientEmail: 'jane.smith@example.com'
                    }
                ]
            };

            jest.spyOn(callHandler['callController'], 'getCall')
                .mockResolvedValue(mockCall);

            await callHandler.getCall(
                mockRequest as Request,
                mockResponse as Response,
                nextFunction
            );

            expect(mockResponse.status).toHaveBeenCalledWith(200);
            expect(mockResponse.json).toHaveBeenCalledWith(mockCall);
        });
    });

    describe('deleteCall', () => {
        it('should return 400 when callID is missing', async () => {
            mockRequest = {
                query: {}
            };

            await callHandler.deleteCall(
                mockRequest as Request,
                mockResponse as Response,
                nextFunction
            );

            expect(nextFunction).toHaveBeenCalledWith(
                expect.objectContaining({
                    errorCode: 400,
                    message: 'Call ID is required'
                })
            );
        });

        it('should return 200 with success message when call is deleted', async () => {
            mockRequest = {
                query: { callID: '1' }
            };

            const mockResult = { message: "Call deleted successfully" };

            jest.spyOn(callHandler['callController'], 'deleteCall')
                .mockResolvedValue(mockResult);

            await callHandler.deleteCall(
                mockRequest as Request,
                mockResponse as Response,
                nextFunction
            );

            expect(mockResponse.status).toHaveBeenCalledWith(200);
            expect(mockResponse.json).toHaveBeenCalledWith(mockResult);
        });

        it('should pass error to next function when controller throws', async () => {
            mockRequest = {
                query: { callID: '1' }
            };

            const error = new Error('Controller error');
            jest.spyOn(callHandler['callController'], 'deleteCall')
                .mockRejectedValue(error);

            await callHandler.deleteCall(
                mockRequest as Request,
                mockResponse as Response,
                nextFunction
            );

            expect(nextFunction).toHaveBeenCalledWith(error);
        });
    });
});