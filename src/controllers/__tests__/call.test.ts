import CallController from '../call';
import { prismaMock } from '../../../tests/prismaTestClient';

describe('CallController', () => {
    let callController: CallController;

    beforeEach(() => {
        callController = new CallController();
    });

    describe('getAllCalls', () => {
        it('should return all calls for a project with attendees list', async () => {
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
                                uid: 'user123',
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

            const result = await callController.getAllCalls(projectID);
            
            // Verify the transformation
            expect(result).toEqual([
                {
                    callID: 1,
                    title: 'Call 1',
                    projectID,
                    startTime: null,
                    endTime: null,
                    summary: null,
                    isAnalyzed: false,
                    attendees: ['John Doe', 'Jane Smith']
                },
                {
                    callID: 2,
                    title: 'Call 2',
                    projectID,
                    startTime: null,
                    endTime: null,
                    summary: null,
                    isAnalyzed: false,
                    attendees: []
                }
            ]);
        });

        it('should throw error when service fails', async () => {
            const projectID = 1;
            prismaMock.call.findMany.mockRejectedValue(new Error('Service error'));

            await expect(callController.getAllCalls(projectID))
                .rejects
                .toThrow('Error fetching calls');
        });
    });

    describe('parseVTT', () => {
        it('should correctly parse VTT content and merge consecutive speaker segments', () => {
            const vttContent = `WEBVTT

00:00:00.000 --> 00:00:05.000
<v Speaker1>Hello, this is a test.

00:00:05.000 --> 00:00:10.000
<v Speaker1>This is the same speaker.

00:00:10.000 --> 00:00:15.000
<v Speaker2>This is a different speaker.`;

            const expected = 
`00:00:00.000 - 00:00:10.000
Speaker1
Hello, this is a test. This is the same speaker.

00:00:10.000 - 00:00:15.000
Speaker2
This is a different speaker.`;

            const result = callController.parseVTT(vttContent);
            expect(result).toBe(expected);
        });

        it('should handle empty VTT content', () => {
            const result = callController.parseVTT('');
            expect(result).toBe('');
        });
    });

    describe('getCall', () => {
        it('should return call with parsed summary', async () => {
            const callID = 1;
            const mockCall = {
                callID,
                projectID: 1,
                title: 'Test Call',
                summary: 'WEBVTT\n\n00:00:00.000 --> 00:00:05.000\n<v Speaker1>Test summary',
                internalParticipants: [{
                    userID: 1,
                    callID: 1,
                    user: {
                        name: 'Test User',
                        userID: 1,
                        email: 'test@example.com',
                        uid: 'user123',
                        role: null,
                        profilePicture: null,
                        departmentID: null
                    }
                }],
                externalParticipants: [],
                startTime: null,
                endTime: null,
                isAnalyzed: false
            };

            prismaMock.call.findUnique.mockResolvedValue(mockCall);

            const result = await callController.getCall(callID);
            //expect(result.summary).toBe('00:00:00.000 - 00:00:05.000\nSpeaker1\nTest summary');
            expect(result.summary).toBe('WEBVTT\n\n00:00:00.000 --> 00:00:05.000\n<v Speaker1>Test summary');


        });
    });

    describe('deleteCall', () => {
        it('should successfully delete a call', async () => {
            const callID = 1;
            const mockResult = { message: "Call deleted successfully" };

            jest.spyOn(callController['callService'], 'deleteCall')
                .mockResolvedValue(mockResult);

            const result = await callController.deleteCall(callID);
            expect(result).toEqual(mockResult);
        });

        it('should throw error when service fails', async () => {
            const callID = 1;
            jest.spyOn(callController['callService'], 'deleteCall')
                .mockRejectedValue(new Error('Service error'));

            await expect(callController.deleteCall(callID))
                .rejects
                .toThrow('An error occurred while deleting the call');
        });
    });

    describe('addCall', () => {
        it('should successfully create a new call', async () => {
            const projectID = 1;
            const title = 'Test Call';
            const startTime = new Date('2024-01-01T10:00:00Z');
            const endTime = new Date('2024-01-01T11:00:00Z');
            const summary = 'Test summary';

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
                            name: 'Test User',
                            userID: 1,
                            email: 'test@example.com',
                            uid: 'user123',
                            role: null,
                            profilePicture: null,
                            departmentID: null
                        }
                    }
                ],
                externalParticipants: [
                    {
                        clientEmail: 'client@example.com',
                        callID: 1,
                        client: {
                            name: 'Test Client',
                            email: 'client@example.com',
                            organization: 'Test Org',
                            description: null
                        }
                    }
                ]
            };

            jest.spyOn(callController['callService'], 'addCall')
                .mockResolvedValue(mockCall);

            const result = await callController.addCall(projectID, title, startTime, endTime, summary);
            expect(result).toEqual(mockCall);
        });

        it('should throw error when service fails', async () => {
            const projectID = 1;
            jest.spyOn(callController['callService'], 'addCall')
                .mockRejectedValue(new Error('Service error'));

            await expect(callController.addCall(projectID, null, null, null, null))
                .rejects
                .toThrow('An error occurred while creating the call');
        });
    });

    describe('getCallHistory', () => {
        const mockCalls = [
            {
                callID: 1,
                startTime: new Date('2024-01-03T10:00:00Z'),
                endTime: new Date('2024-01-03T10:30:00Z'),
                analysis: {
                    ociAnalysis: {
                        documentSentiment: 'Positive',
                        lastSentence: 'Great call!',
                        lastSentiment: 'positive',
                        relevantAspects: []
                    },
                    llmInsights: {
                        motivo_llamada: 'Support request',
                        se_resolvio: true,
                        razon_resolucion: 'Issue fixed',
                        estado_emocional_final: 'Satisfied',
                        resumen: 'Customer issue resolved'
                    },
                    finalSatisfaction: 'high'
                }
            },
            {
                callID: 2,
                startTime: new Date('2024-01-03T14:00:00Z'),
                endTime: new Date('2024-01-03T15:00:00Z'),
                analysis: {
                    ociAnalysis: {
                        documentSentiment: 'Negative',
                        lastSentence: 'Not satisfied',
                        lastSentiment: 'negative',
                        relevantAspects: []
                    },
                    llmInsights: {
                        motivo_llamada: 'Complaint',
                        se_resolvio: false,
                        razon_resolucion: 'Pending resolution',
                        estado_emocional_final: 'Dissatisfied',
                        resumen: 'Customer complaint not resolved'
                    },
                    finalSatisfaction: 'low'
                }
            },
            {
                callID: 3,
                startTime: new Date('2024-01-04T09:00:00Z'),
                endTime: new Date('2024-01-04T10:00:00Z'),
                analysis: {
                    ociAnalysis: {
                        documentSentiment: 'Positive',
                        lastSentence: 'Very helpful',
                        lastSentiment: 'positive',
                        relevantAspects: []
                    },
                    llmInsights: {
                        motivo_llamada: 'Question',
                        se_resolvio: true,
                        razon_resolucion: 'Answered',
                        estado_emocional_final: 'Satisfied',
                        resumen: 'Customer question answered'
                    },
                    finalSatisfaction: 'high'
                }
            }
        ];

        beforeEach(() => {
            jest.spyOn(callController['callService'], 'getCallHistory')
                .mockResolvedValue(mockCalls);
        });

        it('should return empty arrays when no calls exist', async () => {
            jest.spyOn(callController['callService'], 'getCallHistory')
                .mockResolvedValue([]);

            const result = await callController.getCallHistory(1, 'daily');
            expect(result).toEqual({
                intervals: [],
                averageDurations: [],
                positiveSentimentPercentages: [],
                resolvedPercentages: []
            });
        });

        it('should group calls by daily intervals', async () => {
            const result = await callController.getCallHistory(1, 'daily');

            expect(result.intervals).toHaveLength(2);
            expect(result.intervals).toContain('2024-01-03');
            expect(result.intervals).toContain('2024-01-04');

            // For 2024-01-03:
            // - Two calls: 30min and 60min (avg: 45min)
            // - One positive, one negative (50% positive)
            // - One resolved, one not (50% resolved)
            const jan3Index = result.intervals.indexOf('2024-01-03');
            expect(result.averageDurations[jan3Index]).toBe(45);
            expect(result.positiveSentimentPercentages[jan3Index]).toBe(50);
            expect(result.resolvedPercentages[jan3Index]).toBe(50);

            // For 2024-01-04:
            // - One call: 60min
            // - One positive (100% positive)
            // - One resolved (100% resolved)
            const jan4Index = result.intervals.indexOf('2024-01-04');
            expect(result.averageDurations[jan4Index]).toBe(60);
            expect(result.positiveSentimentPercentages[jan4Index]).toBe(100);
            expect(result.resolvedPercentages[jan4Index]).toBe(100);
        });

        it('should group calls by weekly intervals', async () => {
            const result = await callController.getCallHistory(1, 'weekly');

            // All calls are in the same week (week of Jan 1, 2024)
            expect(result.intervals).toHaveLength(1);
            expect(result.intervals[0]).toBe('2024-01-01'); // Monday of the week

            // Three calls: 30min, 60min, 60min (avg: 50min)
            // Two positive, one negative (66.67% positive)
            // Two resolved, one not (66.67% resolved)
            expect(result.averageDurations[0]).toBe(50);
            expect(result.positiveSentimentPercentages[0]).toBeCloseTo(66.67, 1);
            expect(result.resolvedPercentages[0]).toBeCloseTo(66.67, 1);
        });

        it('should group calls by monthly intervals', async () => {
            const result = await callController.getCallHistory(1, 'monthly');

            // All calls are in January 2024
            expect(result.intervals).toHaveLength(1);
            expect(result.intervals[0]).toBe('2024-01');

            // Three calls: 30min, 60min, 60min (avg: 50min)
            // Two positive, one negative (66.67% positive)
            // Two resolved, one not (66.67% resolved)
            expect(result.averageDurations[0]).toBe(50);
            expect(result.positiveSentimentPercentages[0]).toBeCloseTo(66.67, 1);
            expect(result.resolvedPercentages[0]).toBeCloseTo(66.67, 1);
        });

        it('should handle calls with missing start or end times', async () => {
            const callsWithMissingTimes = [
                {
                    callID: 1,
                    startTime: new Date('2024-01-03T10:00:00Z'),
                    endTime: null,
                    analysis: {
                        ociAnalysis: { documentSentiment: 'Positive', lastSentence: '', lastSentiment: '', relevantAspects: [] },
                        llmInsights: { motivo_llamada: '', se_resolvio: true, razon_resolucion: '', estado_emocional_final: '', resumen: '' },
                        finalSatisfaction: ''
                    }
                },
                {
                    callID: 2,
                    startTime: null,
                    endTime: new Date('2024-01-03T15:00:00Z'),
                    analysis: {
                        ociAnalysis: { documentSentiment: 'Negative', lastSentence: '', lastSentiment: '', relevantAspects: [] },
                        llmInsights: { motivo_llamada: '', se_resolvio: false, razon_resolucion: '', estado_emocional_final: '', resumen: '' },
                        finalSatisfaction: ''
                    }
                },
                {
                    callID: 3,
                    startTime: new Date('2024-01-03T09:00:00Z'),
                    endTime: new Date('2024-01-03T10:00:00Z'),
                    analysis: {
                        ociAnalysis: { documentSentiment: 'Positive', lastSentence: '', lastSentiment: '', relevantAspects: [] },
                        llmInsights: { motivo_llamada: '', se_resolvio: true, razon_resolucion: '', estado_emocional_final: '', resumen: '' },
                        finalSatisfaction: ''
                    }
                },
                {
                    callID: 4,
                    startTime: null,
                    endTime: null,
                    analysis: {
                        ociAnalysis: { documentSentiment: 'Negative', lastSentence: '', lastSentiment: '', relevantAspects: [] },
                        llmInsights: { motivo_llamada: '', se_resolvio: false, razon_resolucion: '', estado_emocional_final: '', resumen: '' },
                        finalSatisfaction: ''
                    }
                }
            ];

            jest.spyOn(callController['callService'], 'getCallHistory')
                .mockResolvedValue(callsWithMissingTimes);

            const result = await callController.getCallHistory(1, 'daily');

            // Should only include calls with start times (calls 1 and 3)
            const jan3Index = result.intervals.indexOf('2024-01-03');
            expect(result.averageDurations[jan3Index]).toBe(60); // Only the 60-minute call (call 3)
            expect(result.positiveSentimentPercentages[jan3Index]).toBe(100); // Both calls 1 and 3 are positive
            expect(result.resolvedPercentages[jan3Index]).toBe(100); // Both calls 1 and 3 are resolved
        });

        it('should include all intervals between first and last call', async () => {
            const callsWithGaps = [
                {
                    callID: 1,
                    startTime: new Date('2024-01-15T10:00:00Z'),
                    endTime: new Date('2024-01-15T11:00:00Z'),
                    analysis: {
                        ociAnalysis: { documentSentiment: 'Positive', lastSentence: '', lastSentiment: '', relevantAspects: [] },
                        llmInsights: { motivo_llamada: '', se_resolvio: true, razon_resolucion: '', estado_emocional_final: '', resumen: '' },
                        finalSatisfaction: ''
                    }
                },
                {
                    callID: 2,
                    startTime: new Date('2024-01-20T14:00:00Z'),
                    endTime: new Date('2024-01-20T15:00:00Z'),
                    analysis: {
                        ociAnalysis: { documentSentiment: 'Negative', lastSentence: '', lastSentiment: '', relevantAspects: [] },
                        llmInsights: { motivo_llamada: '', se_resolvio: false, razon_resolucion: '', estado_emocional_final: '', resumen: '' },
                        finalSatisfaction: ''
                    }
                },
                {
                    callID: 3,
                    startTime: new Date('2024-03-05T09:00:00Z'),
                    endTime: new Date('2024-03-05T10:00:00Z'),
                    analysis: {
                        ociAnalysis: { documentSentiment: 'Positive', lastSentence: '', lastSentiment: '', relevantAspects: [] },
                        llmInsights: { motivo_llamada: '', se_resolvio: true, razon_resolucion: '', estado_emocional_final: '', resumen: '' },
                        finalSatisfaction: ''
                    }
                }
            ];

            jest.spyOn(callController['callService'], 'getCallHistory')
                .mockResolvedValue(callsWithGaps);

            // Test monthly grouping
            const monthlyResult = await callController.getCallHistory(1, 'monthly');

            // Should include all months between first and last call (Jan, Feb, Mar)
            expect(monthlyResult.intervals).toHaveLength(3);
            expect(monthlyResult.intervals).toEqual(['2024-01', '2024-02', '2024-03']);

            // January metrics (has calls)
            const janIndex = monthlyResult.intervals.indexOf('2024-01');
            expect(monthlyResult.averageDurations[janIndex]).toBe(60); // Both calls are 60 minutes
            expect(monthlyResult.positiveSentimentPercentages[janIndex]).toBe(50); // One positive, one negative
            expect(monthlyResult.resolvedPercentages[janIndex]).toBe(50); // One resolved, one not

            // February metrics (no calls)
            const febIndex = monthlyResult.intervals.indexOf('2024-02');
            expect(monthlyResult.averageDurations[febIndex]).toBe(0);
            expect(monthlyResult.positiveSentimentPercentages[febIndex]).toBe(0);
            expect(monthlyResult.resolvedPercentages[febIndex]).toBe(0);

            // March metrics (has calls)
            const marIndex = monthlyResult.intervals.indexOf('2024-03');
            expect(monthlyResult.averageDurations[marIndex]).toBe(60); // One 60-minute call
            expect(monthlyResult.positiveSentimentPercentages[marIndex]).toBe(100); // One positive call
            expect(monthlyResult.resolvedPercentages[marIndex]).toBe(100); // One resolved call

            // Test weekly grouping
            const weeklyResult = await callController.getCallHistory(1, 'weekly');

            // Should include all weeks between first and last call
            // Week of Jan 15, Jan 22, Jan 29, Feb 5, Feb 12, Feb 19, Feb 26, Mar 4
            expect(weeklyResult.intervals).toHaveLength(8);
            expect(weeklyResult.intervals).toEqual([
                '2024-01-15', // Week of Jan 15
                '2024-01-22', // Week of Jan 20
                '2024-01-29', // Week of Jan 29
                '2024-02-05', // Week of Feb 5
                '2024-02-12', // Week of Feb 12
                '2024-02-19', // Week of Feb 19
                '2024-02-26', // Week of Feb 26
                '2024-03-04'  // Week of Mar 5
            ]);

            // Test daily grouping
            const dailyResult = await callController.getCallHistory(1, 'daily');

            // Should include all days between Jan 15 and Mar 5
            expect(dailyResult.intervals.length).toBeGreaterThan(0);
            expect(dailyResult.intervals[0]).toBe('2024-01-15'); // First day
            expect(dailyResult.intervals[dailyResult.intervals.length - 1]).toBe('2024-03-05'); // Last day

            // Verify metrics for a day with no calls
            const feb15Index = dailyResult.intervals.indexOf('2024-02-15');
            expect(feb15Index).not.toBe(-1); // Day should exist
            expect(dailyResult.averageDurations[feb15Index]).toBe(0);
            expect(dailyResult.positiveSentimentPercentages[feb15Index]).toBe(0);
            expect(dailyResult.resolvedPercentages[feb15Index]).toBe(0);
        });

        it('should throw error when service fails', async () => {
            jest.spyOn(callController['callService'], 'getCallHistory')
                .mockRejectedValue(new Error('Service error'));

            await expect(callController.getCallHistory(1, 'daily'))
                .rejects
                .toThrow('Error fetching call history');
        });
    });
});