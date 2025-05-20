import CallController from '../call';
import { prismaMock } from '../../../tests/prismaTestClient';

describe('CallController', () => {
    let callController: CallController;

    beforeEach(() => {
        callController = new CallController();
    });

    describe('getAllCalls', () => {
        it('should return all calls for a project', async () => {
            const projectID = 1;
            const mockCalls = [
                { callID: 1, title: 'Call 1', projectID, startTime: null, endTime: null, summary: null },
                { callID: 2, title: 'Call 2', projectID, startTime: null, endTime: null, summary: null }
            ];

            prismaMock.call.findMany.mockResolvedValue(mockCalls);

            const result = await callController.getAllCalls(projectID);
            expect(result).toEqual(mockCalls);
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
                internalParticipants: [],
                externalParticipants: [],
                startTime: null,
                endTime: null,
            };

            prismaMock.call.findUnique.mockResolvedValue(mockCall);

            const result = await callController.getCall(callID);
            //expect(result.summary).toBe('00:00:00.000 - 00:00:05.000\nSpeaker1\nTest summary');
            expect(result.summary).toBe('WEBVTT\n\n00:00:00.000 --> 00:00:05.000\n<v Speaker1>Test summary');


        });
    });
});