import CallService from '../call';
import { prismaMock } from '../../../tests/prismaTestClient';
import HttpException from '../../models/http-exception';

describe('CallService', () => {
    let callService: CallService;

    beforeEach(() => {
        callService = new CallService();
    });

    describe('getAllCalls', () => {
        it('should return all calls for a project', async () => {
            const projectID = 1;
            const mockCalls = [
                { callID: 1, title: 'Call 1', projectID, startTime: null, endTime: null, summary: null, analyzed: false },
                { callID: 2, title: 'Call 2', projectID, startTime: null, endTime: null, summary: null, analyzed: false },
            ];

            prismaMock.call.findMany.mockResolvedValue(mockCalls);

            const result = await callService.getAllCalls(projectID);
            expect(result).toEqual(mockCalls);
        });

        it('should throw HttpException when database query fails', async () => {
            const projectID = 1;
            prismaMock.call.findMany.mockRejectedValue(new Error('DB error'));

            await expect(callService.getAllCalls(projectID))
                .rejects
                .toThrow(HttpException);
        });
    });

    describe('getCall', () => {
        it('should return call with participants', async () => {
            const callID = 1;
            const mockCall = {
                callID,
                title: 'Test Call',
                summary: 'Test summary',
                projectID: 1,
                startTime: new Date(),
                endTime: new Date(),
                analyzed: false,
                internalParticipants: [
                    {
                        user: { userID: 1, name: 'Internal User' }
                    }
                ],
                externalParticipants: [
                    {
                        client: { email: 'client@test.com', name: 'External Client' }
                    }
                ]
            };

            prismaMock.call.findUnique.mockResolvedValue(mockCall);

            const result = await callService.getCall(callID);
            expect(result).toEqual(mockCall);
        });

        it('should throw HttpException when call not found', async () => {
            const callID = 999;
            prismaMock.call.findUnique.mockResolvedValue(null);

            await expect(callService.getCall(callID))
                .rejects
                .toThrow(HttpException);
        });
    });

    describe('deleteCall', () => {
        it('should successfully delete an existing call', async () => {
            const callID = 1;
            const mockCall = {
                callID,
                title: 'Test Call',
                projectID: 1,
                startTime: null,
                endTime: null,
                summary: null,
                analyzed: false
            };

            prismaMock.call.findUnique.mockResolvedValue(mockCall);
            prismaMock.call.delete.mockResolvedValue(mockCall);

            const result = await callService.deleteCall(callID);
            expect(result).toEqual({ message: "Call deleted successfully" });
            expect(prismaMock.call.delete).toHaveBeenCalledWith({
                where: { callID }
            });
        });

        it('should throw HttpException when call not found', async () => {
            const callID = 999;
            prismaMock.call.findUnique.mockResolvedValue(null);

            await expect(callService.deleteCall(callID))
                .rejects
                .toThrow(HttpException);
            expect(prismaMock.call.delete).not.toHaveBeenCalled();
        });

        it('should throw HttpException when database operation fails', async () => {
            const callID = 1;
            const mockCall = {
                callID,
                title: 'Test Call',
                projectID: 1,
                startTime: null,
                endTime: null,
                summary: null,
                analyzed: false
            };
            prismaMock.call.findUnique.mockResolvedValue(mockCall);
            prismaMock.call.delete.mockRejectedValue(new Error('DB error'));

            await expect(callService.deleteCall(callID))
                .rejects
                .toThrow(HttpException);
        });
    });
});