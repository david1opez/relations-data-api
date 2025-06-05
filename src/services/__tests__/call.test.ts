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
                { 
                    callID: 1, 
                    title: 'Call 1', 
                    projectID, 
                    startTime: null, 
                    endTime: null, 
                    summary: null, 
                    isAnalyzed: false,
                    internalParticipants: [
                        {
                            userID: 1,
                            callID: 1,
                            user: {
                                userID: 1,
                                name: 'John Doe',
                                email: 'john@example.com',
                                uid: null,
                                password: null,
                                role: null,
                                profilePicture: null,
                                departmentID: null
                            }
                        }
                    ],
                    externalParticipants: [
                        {
                            clientEmail: 'jane@example.com',
                            callID: 1,
                            client: {
                                name: 'Jane Smith',
                                email: 'jane@example.com',
                                organization: 'Client Corp',
                                description: null
                            }
                        }
                    ]
                },
                { 
                    callID: 2, 
                    title: 'Call 2', 
                    projectID, 
                    startTime: null, 
                    endTime: null, 
                    summary: null, 
                    isAnalyzed: false,
                    internalParticipants: [],
                    externalParticipants: []
                }
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
                        userID: 1,
                        callID: 1,
                        user: {
                            userID: 1,
                            name: 'Internal User',
                            email: 'internal@test.com',
                            uid: 'user123',
                            role: null,
                            profilePicture: null,
                            departmentID: null
                        }
                    }
                ],
                externalParticipants: [
                    {
                        clientEmail: 'client@test.com',
                        callID: 1,
                        client: {
                            name: 'External Client',
                            email: 'client@test.com',
                            organization: 'Test Org',
                            description: null
                        }
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
                    {
                        userID: 1,
                        callID: 1,
                        user: {
                            userID: 1,
                            name: 'User 1',
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
                            userID: 2,
                            name: 'User 2',
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

    describe('getCallHistory', () => {
        const mockCalls = [
            {
                callID: 1,
                title: null,
                startTime: new Date('2024-01-03T10:00:00Z'),
                endTime: new Date('2024-01-03T10:30:00Z'),
                summary: null,
                projectID: 1,
                isAnalyzed: true,
                internalParticipants: [
                    { userID: 1, callID: 1 }
                ]
            },
            {
                callID: 2,
                title: null,
                startTime: new Date('2024-01-04T14:00:00Z'),
                endTime: new Date('2024-01-04T15:00:00Z'),
                summary: null,
                projectID: 1,
                isAnalyzed: true,
                internalParticipants: [
                    { userID: 2, callID: 2 }
                ]
            }
        ];

        const mockApiResponse = {
            results: [
                {
                    _id: "6838e71de3294e09a2816576",
                    callID: 1,
                    timestamp: "2024-01-03T10:30:00Z",
                    originalText: "",
                    resultado: {
                        ociAnalysis: {
                            documentSentiment: "Positive",
                            lastSentence: "Thank you everyone for your participation today.",
                            lastSentiment: "Neutral",
                            relevantAspects: []
                        },
                        llmInsights: {
                            motivo_llamada: "Support request",
                            se_resolvio: true,
                            razon_resolucion: "Issue fixed",
                            estado_emocional_final: "Satisfied",
                            resumen: "Customer issue resolved"
                        },
                        finalSatisfaction: "Positiva"
                    }
                },
                {
                    _id: "6838f83deaa36674cea7f432",
                    callID: 2,
                    timestamp: "2024-01-04T15:00:00Z",
                    originalText: "",
                    resultado: {
                        ociAnalysis: {
                            documentSentiment: "Positive",
                            lastSentence: "Thank you everyone for your participation today.",
                            lastSentiment: "Neutral",
                            relevantAspects: []
                        },
                        llmInsights: {
                            motivo_llamada: "Question",
                            se_resolvio: false,
                            razon_resolucion: "Pending follow-up",
                            estado_emocional_final: "Neutral",
                            resumen: "Customer question answered"
                        },
                        finalSatisfaction: "Positiva"
                    }
                }
            ]
        };

        beforeEach(() => {
            prismaMock.call.findMany.mockResolvedValue(mockCalls);
            // Mock fetch globally
            global.fetch = jest.fn().mockResolvedValue({
                ok: true,
                json: () => Promise.resolve(mockApiResponse)
            });
        });

        afterEach(() => {
            jest.restoreAllMocks();
        });

        it('should filter calls by userID when provided', async () => {
            const userID = 1;
            const filteredCalls = [mockCalls[0]]; // Only the first call has userID 1
            prismaMock.call.findMany.mockResolvedValue(filteredCalls);

            const result = await callService.getCallHistory(1, userID);

            expect(prismaMock.call.findMany).toHaveBeenCalledWith({
                where: {
                    projectID: 1,
                    isAnalyzed: true,
                    internalParticipants: {
                        some: {
                            userID: userID
                        }
                    }
                },
                select: {
                    callID: true,
                    startTime: true,
                    endTime: true
                },
                orderBy: {
                    startTime: 'asc'
                }
            });

            expect(result).toHaveLength(1);
            expect(result[0].callID).toBe(1);
        });

        it('should not filter by userID when not provided', async () => {
            const result = await callService.getCallHistory(1);

            expect(prismaMock.call.findMany).toHaveBeenCalledWith({
                where: {
                    projectID: 1,
                    isAnalyzed: true
                },
                select: {
                    callID: true,
                    startTime: true,
                    endTime: true
                },
                orderBy: {
                    startTime: 'asc'
                }
            });

            expect(result).toHaveLength(2);
        });

        it('should return empty array when no calls exist', async () => {
            prismaMock.call.findMany.mockResolvedValue([]);

            const result = await callService.getCallHistory(1);
            expect(result).toEqual([]);
            expect(global.fetch).not.toHaveBeenCalled();
        });

        it('should return calls with analysis data', async () => {
            const result = await callService.getCallHistory(1);

            expect(global.fetch).toHaveBeenCalledWith(
                'https://x5fruv6w29.execute-api.us-east-2.amazonaws.com/analysis?callID=1,2'
            );
            expect(result).toHaveLength(2);
            expect(result[0]).toEqual({
                ...mockCalls[0],
                analysis: mockApiResponse.results[0].resultado
            });
            expect(result[1]).toEqual({
                ...mockCalls[1],
                analysis: mockApiResponse.results[1].resultado
            });
        });

        it('should throw HttpException when API call fails', async () => {
            global.fetch = jest.fn().mockResolvedValue({
                ok: false,
                status: 500,
                statusText: 'Internal Server Error'
            });

            await expect(callService.getCallHistory(1))
                .rejects
                .toThrow(HttpException);
        });

        it('should throw HttpException when database query fails', async () => {
            prismaMock.call.findMany.mockRejectedValue(new Error('DB error'));

            await expect(callService.getCallHistory(1))
                .rejects
                .toThrow(HttpException);
            expect(global.fetch).not.toHaveBeenCalled();
        });
    });
});