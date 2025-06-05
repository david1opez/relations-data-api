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
                { 
                    callID: 1, 
                    title: 'Call 1', 
                    startTime: null, 
                    endTime: null, 
                    summary: null, 
                    isAnalyzed: false,
                    attendees: ['user1@test.com', 'user2@test.com']
                },
                { 
                    callID: 2, 
                    title: 'Call 2', 
                    startTime: null, 
                    endTime: null, 
                    summary: null, 
                    isAnalyzed: false,
                    attendees: ['user3@test.com']
                }
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
                isAnalyzed: false,
                internalParticipants: [
                    {
                        user: {
                            name: 'John Doe',
                            userID: 1,
                            email: 'john.doe@example.com',
                            uid: 'user123',
                            role: 'Manager' as string | null,
                            departmentID: 101 as number | null,
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

    describe('addCall', () => {
        it('should return 400 when projectID is missing', async () => {
            mockRequest = {
                body: {}
            };

            await callHandler.addCall(
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

        it('should return 400 when internalParticipants is not an array', async () => {
            mockRequest = {
                body: {
                    projectID: 1,
                    internalParticipants: 'not an array'
                }
            };

            await callHandler.addCall(
                mockRequest as Request,
                mockResponse as Response,
                nextFunction
            );

            expect(nextFunction).toHaveBeenCalledWith(
                expect.objectContaining({
                    errorCode: 400,
                    message: 'Internal participants must be an array of user IDs'
                })
            );
        });

        it('should return 400 when externalParticipants is not an array', async () => {
            mockRequest = {
                body: {
                    projectID: 1,
                    externalParticipants: 'not an array'
                }
            };

            await callHandler.addCall(
                mockRequest as Request,
                mockResponse as Response,
                nextFunction
            );

            expect(nextFunction).toHaveBeenCalledWith(
                expect.objectContaining({
                    errorCode: 400,
                    message: 'External participants must be an array of client emails'
                })
            );
        });

        it('should return 201 with created call when successful', async () => {
            const projectID = 1;
            const title = 'Test Call';
            const startTime = '2024-01-01T10:00:00Z';
            const endTime = '2024-01-01T11:00:00Z';
            const summary = 'Test summary';
            const internalParticipants = [1, 2];
            const externalParticipants = ['client1@test.com', 'client2@test.com'];

            mockRequest = {
                body: { 
                    projectID, 
                    title, 
                    startTime, 
                    endTime, 
                    summary,
                    internalParticipants,
                    externalParticipants
                }
            };

            const mockCall = {
                callID: 1,
                projectID,
                title,
                startTime: new Date(startTime),
                endTime: new Date(endTime),
                summary,
                isAnalyzed: false,
                internalParticipants: [
                    { 
                        userID: 1, 
                        callID: 1,
                        user: { 
                            name: 'User 1',
                            userID: 1,
                            email: 'user1@test.com',
                            uid: 'user123',
                            role: null,
                            profilePicture: null,
                            departmentID: null
                        } 
                    },
                    { 
                        userID: 2, 
                        callID: 1,
                        user: { 
                            name: 'User 2',
                            userID: 2,
                            email: 'user2@test.com',
                            uid: 'user456',
                            role: null,
                            profilePicture: null,
                            departmentID: null
                        } 
                    }
                ],
                externalParticipants: [
                    { 
                        clientEmail: 'client1@test.com', 
                        callID: 1,
                        client: { 
                            name: 'Client 1',
                            email: 'client1@test.com',
                            organization: 'Org 1',
                            description: null
                        } 
                    },
                    { 
                        clientEmail: 'client2@test.com', 
                        callID: 1,
                        client: { 
                            name: 'Client 2',
                            email: 'client2@test.com',
                            organization: 'Org 2',
                            description: null
                        } 
                    }
                ]
            };

            jest.spyOn(callHandler['callController'], 'addCall')
                .mockResolvedValue(mockCall);

            await callHandler.addCall(
                mockRequest as Request,
                mockResponse as Response,
                nextFunction
            );

            expect(mockResponse.status).toHaveBeenCalledWith(201);
            expect(mockResponse.json).toHaveBeenCalledWith(mockCall);
            expect(callHandler['callController'].addCall).toHaveBeenCalledWith(
                projectID,
                title,
                new Date(startTime),
                new Date(endTime),
                summary,
                internalParticipants,
                externalParticipants
            );
        });

        it('should handle null optional fields', async () => {
            const projectID = 1;
            mockRequest = {
                body: { projectID }
            };

            const mockCall = {
                callID: 1,
                projectID,
                title: null,
                startTime: null,
                endTime: null,
                summary: null,
                isAnalyzed: false,
                internalParticipants: [],
                externalParticipants: []
            };

            jest.spyOn(callHandler['callController'], 'addCall')
                .mockResolvedValue(mockCall);

            await callHandler.addCall(
                mockRequest as Request,
                mockResponse as Response,
                nextFunction
            );

            expect(mockResponse.status).toHaveBeenCalledWith(201);
            expect(mockResponse.json).toHaveBeenCalledWith(mockCall);
            expect(callHandler['callController'].addCall).toHaveBeenCalledWith(
                projectID,
                null,
                null,
                null,
                null,
                [],
                []
            );
        });

        it('should pass error to next function when controller throws', async () => {
            const projectID = 1;
            mockRequest = {
                body: { projectID }
            };

            const error = new Error('Controller error');
            jest.spyOn(callHandler['callController'], 'addCall')
                .mockRejectedValue(error);

            await callHandler.addCall(
                mockRequest as Request,
                mockResponse as Response,
                nextFunction
            );

            expect(nextFunction).toHaveBeenCalledWith(error);
        });
    });

    describe('getCallHistory', () => {
        const mockHistory = {
            intervals: ['2024-01-01', '2024-01-02'],
            averageDurations: [45, 60],
            positiveSentimentPercentages: [75, 50],
            resolvedPercentages: [80, 60]
        };

        beforeEach(() => {
            jest.spyOn(callHandler['callController'], 'getCallHistory')
                .mockResolvedValue(mockHistory);
        });

        it('should return 400 when projectID is missing', async () => {
            mockRequest = {
                query: {}
            };

            await callHandler.getCallHistory(
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

        it('should return 400 when interval is missing', async () => {
            mockRequest = {
                query: { projectID: '1' }
            };

            await callHandler.getCallHistory(
                mockRequest as Request,
                mockResponse as Response,
                nextFunction
            );

            expect(nextFunction).toHaveBeenCalledWith(
                expect.objectContaining({
                    errorCode: 400,
                    message: 'Valid interval (daily, weekly, or monthly) is required'
                })
            );
        });

        it('should return 400 when interval is invalid', async () => {
            mockRequest = {
                query: { 
                    projectID: '1',
                    interval: 'invalid'
                }
            };

            await callHandler.getCallHistory(
                mockRequest as Request,
                mockResponse as Response,
                nextFunction
            );

            expect(nextFunction).toHaveBeenCalledWith(
                expect.objectContaining({
                    errorCode: 400,
                    message: 'Valid interval (daily, weekly, or monthly) is required'
                })
            );
        });

        it('should return 200 with history data when successful with userID', async () => {
            mockRequest = {
                query: { 
                    projectID: '1',
                    interval: 'daily',
                    userID: '123'
                }
            };

            await callHandler.getCallHistory(
                mockRequest as Request,
                mockResponse as Response,
                nextFunction
            );

            expect(mockResponse.status).toHaveBeenCalledWith(200);
            expect(mockResponse.json).toHaveBeenCalledWith(mockHistory);
            expect(callHandler['callController'].getCallHistory)
                .toHaveBeenCalledWith(1, 'daily', 123);
        });

        it('should return 200 with history data when successful without userID', async () => {
            mockRequest = {
                query: { 
                    projectID: '1',
                    interval: 'daily'
                }
            };

            await callHandler.getCallHistory(
                mockRequest as Request,
                mockResponse as Response,
                nextFunction
            );

            expect(mockResponse.status).toHaveBeenCalledWith(200);
            expect(mockResponse.json).toHaveBeenCalledWith(mockHistory);
            expect(callHandler['callController'].getCallHistory)
                .toHaveBeenCalledWith(1, 'daily', undefined);
        });

        it('should pass error to next function when controller throws', async () => {
            mockRequest = {
                query: { 
                    projectID: '1',
                    interval: 'daily'
                }
            };

            const error = new Error('Controller error');
            jest.spyOn(callHandler['callController'], 'getCallHistory')
                .mockRejectedValue(error);

            await callHandler.getCallHistory(
                mockRequest as Request,
                mockResponse as Response,
                nextFunction
            );

            expect(nextFunction).toHaveBeenCalledWith(error);
        });
    });
});