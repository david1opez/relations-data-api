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
                expect.any(HttpException)
            );
        });

        it('should return 200 with calls when successful', async () => {
            mockRequest = {
                query: { projectID: '1' }
            };

            const mockCalls = [
                { callID: 1, title: 'Call 1', startTime: null, endTime: null },
                { callID: 2, title: 'Call 2', startTime: null, endTime: null }
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
                expect.any(HttpException)
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
                internalParticipants: [
                    {
                        user: {
                            name: 'John Doe',
                            userID: 1,
                            email: 'john.doe@example.com',
                            role: 'Manager' as string | null,
                            departmentID: 101 as number | null,
                            password: null,
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
                            organization: 'External Org'
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
});