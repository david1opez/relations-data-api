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
                { callID: 1, title: 'Call 1', projectID, startTime: null, endTime: null, summary: null, isAnalyzed: false },
                { callID: 2, title: 'Call 2', projectID, startTime: null, endTime: null, summary: null, isAnalyzed: false },
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
                isAnalyzed: false,
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
                isAnalyzed: false
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
                isAnalyzed: false
            };
            prismaMock.call.findUnique.mockResolvedValue(mockCall);
            prismaMock.call.delete.mockRejectedValue(new Error('DB error'));

            await expect(callService.deleteCall(callID))
                .rejects
                .toThrow(HttpException);
        });
    });

    describe('addCall', () => {
        it('should throw 404 when project does not exist', async () => {
            const projectID = 999;
            prismaMock.project.findUnique.mockResolvedValue(null);

            await expect(callService.addCall(projectID, null, null, null, null))
                .rejects
                .toThrow(HttpException);
        });

        it('should successfully create a new call with participants', async () => {
            const projectID = 1;
            const title = 'Test Call';
            const startTime = new Date('2024-01-01T10:00:00Z');
            const endTime = new Date('2024-01-01T11:00:00Z');
            const summary = 'Test summary';
            const internalParticipants = [1, 2];
            const externalParticipants = ['client1@test.com', 'client2@test.com'];

            const mockProject = {
                projectID,
                name: 'Test Project',
                clientEmail: null,
                description: null,
                problemDescription: null,
                reqFuncionales: null,
                reqNoFuncionales: null,
                startDate: null,
                endDate: null
            };

            const mockCall = {
                callID: 1,
                projectID,
                title,
                startTime,
                endTime,
                summary,
                isAnalyzed: false,
                internalParticipants: [
                    { userID: 1, user: { name: 'User 1' } },
                    { userID: 2, user: { name: 'User 2' } }
                ],
                externalParticipants: [
                    { clientEmail: 'client1@test.com', client: { name: 'Client 1' } },
                    { clientEmail: 'client2@test.com', client: { name: 'Client 2' } }
                ]
            };

            prismaMock.project.findUnique.mockResolvedValue(mockProject);
            prismaMock.$transaction.mockImplementation((callback: unknown) => {
                if (typeof callback === 'function') {
                    return Promise.resolve(callback(prismaMock));
                }
                return Promise.resolve(callback);
            });
            prismaMock.call.create.mockResolvedValue(mockCall);

            const result = await callService.addCall(
                projectID, 
                title, 
                startTime, 
                endTime, 
                summary,
                internalParticipants,
                externalParticipants
            );

            expect(result).toEqual(mockCall);
            expect(prismaMock.call.create).toHaveBeenCalledWith({
                data: {
                    projectID,
                    title,
                    startTime,
                    endTime,
                    summary,
                    isAnalyzed: false,
                    internalParticipants: {
                        create: internalParticipants.map(userID => ({ userID }))
                    },
                    externalParticipants: {
                        create: externalParticipants.map(clientEmail => ({ clientEmail }))
                    }
                },
                include: {
                    internalParticipants: {
                        include: {
                            user: true
                        }
                    },
                    externalParticipants: {
                        include: {
                            client: true
                        }
                    }
                }
            });
        });

        it('should create a call without participants', async () => {
            const projectID = 1;
            const mockProject = {
                projectID,
                name: 'Test Project',
                clientEmail: null,
                description: null,
                problemDescription: null,
                reqFuncionales: null,
                reqNoFuncionales: null,
                startDate: null,
                endDate: null
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

            prismaMock.project.findUnique.mockResolvedValue(mockProject);
            prismaMock.$transaction.mockImplementation((callback: unknown) => {
                if (typeof callback === 'function') {
                    return Promise.resolve(callback(prismaMock));
                }
                return Promise.resolve(callback);
            });
            prismaMock.call.create.mockResolvedValue(mockCall);

            const result = await callService.addCall(projectID, null, null, null, null);
            expect(result).toEqual(mockCall);
            expect(prismaMock.call.create).toHaveBeenCalledWith({
                data: {
                    projectID,
                    title: null,
                    startTime: null,
                    endTime: null,
                    summary: null,
                    isAnalyzed: false
                },
                include: {
                    internalParticipants: {
                        include: {
                            user: true
                        }
                    },
                    externalParticipants: {
                        include: {
                            client: true
                        }
                    }
                }
            });
        });

        it('should throw 400 when invalid participant ID is provided', async () => {
            const projectID = 1;
            const mockProject = {
                projectID,
                name: 'Test Project',
                clientEmail: null,
                description: null,
                problemDescription: null,
                reqFuncionales: null,
                reqNoFuncionales: null,
                startDate: null,
                endDate: null
            };

            prismaMock.project.findUnique.mockResolvedValue(mockProject);
            prismaMock.$transaction.mockImplementation((callback: unknown) => {
                if (typeof callback === 'function') {
                    return Promise.resolve(callback(prismaMock));
                }
                return Promise.resolve(callback);
            });
            prismaMock.call.create.mockRejectedValue({ code: 'P2003' });

            await expect(callService.addCall(projectID, null, null, null, null, [999]))
                .rejects
                .toThrow(HttpException);
        });

        it('should throw HttpException when database operation fails', async () => {
            const projectID = 1;
            const mockProject = {
                projectID,
                name: 'Test Project',
                clientEmail: null,
                description: null,
                problemDescription: null,
                reqFuncionales: null,
                reqNoFuncionales: null,
                startDate: null,
                endDate: null
            };

            prismaMock.project.findUnique.mockResolvedValue(mockProject);
            prismaMock.$transaction.mockImplementation((callback: unknown) => {
                if (typeof callback === 'function') {
                    return Promise.resolve(callback(prismaMock));
                }
                return Promise.resolve(callback);
            });
            prismaMock.call.create.mockRejectedValue(new Error('DB error'));

            await expect(callService.addCall(projectID, null, null, null, null))
                .rejects
                .toThrow(HttpException);
        });
    });
});