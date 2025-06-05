import CallService from "../services/call";

interface OciAnalysis {
    documentSentiment: string;
    lastSentence: string;
    lastSentiment: string;
    relevantAspects: string[];
}

interface LlmInsights {
    motivo_llamada: string;
    se_resolvio: boolean;
    razon_resolucion: string;
    estado_emocional_final: string;
    resumen: string;
}

interface CallAnalysis {
    ociAnalysis: OciAnalysis;
    llmInsights: LlmInsights;
    finalSatisfaction: string;
}

interface CallWithAnalysis {
    callID: number;
    startTime: Date | null;
    endTime: Date | null;
    analysis: CallAnalysis | null;
}

class CallController {
    private callService: CallService;
    constructor() {
        this.callService = new CallService();
    }
    
    //Recieves vtt, removes unnecessary lines, and merges consecutive lines from the same speaker
    parseVTT(vttContent: string): string {
        if (!vttContent.startsWith("WEBVTT")) {
            return vttContent;
        }

        // Split the content into blocks (separated by one or more blank lines)
        const blocks = vttContent.split(/\n\s*\n/).map(b => b.trim()).filter(b => b && !b.startsWith("WEBVTT"));
    
        interface Segment {
            start: string;
            end: string;
            speaker: string;
            text: string;
        }
    
        const segments: Segment[] = [];
    
        for (const block of blocks) {
            const lines = block.split('\n').map(line => line.trim());
            if (lines.length < 2) continue;
    
            // Timestamps contains '-->'
            const timeLineIndex = lines.findIndex(line => line.includes('-->'));
            if (timeLineIndex === -1) continue;
            const timeLine = lines[timeLineIndex];
            const [start, end] = timeLine.split('-->').map(t => t.trim());
    
            const textLines = lines.slice(timeLineIndex + 1).join(' ');
            // Extract the speaker using a regex that matches <v SpeakerName>
            const speakerMatch = textLines.match(/<v\s+([^>]+)>/);
            let speaker = speakerMatch ? speakerMatch[1] : 'Unknown';
            // Remove the tags from the text
            const cleanedText = textLines.replace(/<[^>]+>/g, '').trim();
            
            segments.push({ start, end, speaker, text: cleanedText });
        }
    
        // Group segments by consecutive speaker changes
        interface Group {
            start: string;
            end: string;
            speaker: string;
            text: string[];
        }
        const groups: Group[] = [];
    
        for (const segment of segments) {
            if (!groups.length || groups[groups.length - 1].speaker !== segment.speaker) {
            groups.push({
                start: segment.start,
                end: segment.end,
                speaker: segment.speaker,
                text: [segment.text]
            });
            } else {
            // Update the end time and append the text if the same speaker
            const lastGroup = groups[groups.length - 1];
            lastGroup.end = segment.end;
            lastGroup.text.push(segment.text);
            }
        }
    
        // Build the final output string
        const outputLines: string[] = [];
        for (const group of groups) {
            outputLines.push(`${group.start} - ${group.end}`);
            outputLines.push(group.speaker);
            outputLines.push(group.text.join(' '));
            outputLines.push(''); // blank line between groups
        }

        if (groups.length > 0) {
            outputLines.pop();
        }
    
        return outputLines.join('\n');
    }

    async getAllCalls(projectID: number) { 
        try {
            const calls = await this.callService.getAllCalls(projectID);
            
            // Transform the calls to include attendees (only names)
            return calls.map(call => {
                const attendees = [
                    ...(call.internalParticipants?.map(participant => participant.user.name) || []),
                    ...(call.externalParticipants?.map(participant => participant.client.name) || [])
                ];

                // Remove the original participant arrays and add attendees
                const { internalParticipants, externalParticipants, ...callWithoutParticipants } = call;
                return {
                    ...callWithoutParticipants,
                    attendees
                };
            });
        } catch (err) {
            throw new Error("Error fetching calls: " + err);
        }
    }

    async getCall(callID: number) {
        try {        
            const call = await this.callService.getCall(callID);

            //if (call.summary) {
             //   call.summary = this.parseVTT(call.summary); 
            //}

            return call;
        } catch (err) {
            throw new Error("An error occurred while fetching the call: " + err);
        }
    }

    async deleteCall(callID: number) {
        try {
            const result = await this.callService.deleteCall(callID);
            return result;
        } catch (err) {
            throw new Error("An error occurred while deleting the call: " + err);
        }
    }

    async markCallAsAnalyzed(callID: number) {
    try {
        return await this.callService.markCallAsAnalyzed(callID);
    } catch (err) {
        throw new Error("An error occurred while marking the call as analyzed: " + err);
    }
}

    async addCall(
        projectID: number, 
        title: string | null, 
        startTime: Date | null, 
        endTime: Date | null, 
        summary: string | null,
        internalParticipants: number[] = [],
        externalParticipants: string[] = []
    ) {
        try {
            const call = await this.callService.addCall(
                projectID, 
                title, 
                startTime, 
                endTime, 
                summary,
                internalParticipants,
                externalParticipants
            );
            return call;
        } catch (err) {
            throw new Error("An error occurred while creating the call: " + err);
        }
    }

    async getCallHistory(projectID: number, interval: 'daily' | 'weekly' | 'monthly', userID?: number) {
        try {
            const calls = await this.callService.getCallHistory(projectID, userID) as CallWithAnalysis[];

            if (calls.length === 0) {
                return {
                    intervals: [],
                    averageDurations: [],
                    positiveSentimentPercentages: [],
                    resolvedPercentages: []
                };
            }

            // Filter out calls without start times and sort by start time
            const validCalls = calls.filter(call => call.startTime)
                .sort((a, b) => new Date(a.startTime!).getTime() - new Date(b.startTime!).getTime());

            if (validCalls.length === 0) {
                return {
                    intervals: [],
                    averageDurations: [],
                    positiveSentimentPercentages: [],
                    resolvedPercentages: []
                };
            }

            // Get the first and last dates
            const firstDate = new Date(validCalls[0].startTime!);
            const lastDate = new Date(validCalls[validCalls.length - 1].startTime!);

            // Generate all intervals between first and last date
            const intervals: string[] = [];
            let currentDate = new Date(firstDate);

            // Helper function to get interval key for a date
            const getIntervalKey = (date: Date): string => {
                switch (interval) {
                    case 'daily':
                        return date.toISOString().split('T')[0];
                    case 'weekly': {
                        // Get the Monday of the week
                        const day = date.getDay();
                        const diff = date.getDate() - day + (day === 0 ? -6 : 1);
                        const monday = new Date(date);
                        monday.setDate(diff);
                        return monday.toISOString().split('T')[0];
                    }
                    case 'monthly':
                        return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
                }
            };

            // Helper function to increment date based on interval
            const incrementDate = (date: Date): void => {
                switch (interval) {
                    case 'daily':
                        date.setDate(date.getDate() + 1);
                        break;
                    case 'weekly':
                        date.setDate(date.getDate() + 7);
                        break;
                    case 'monthly':
                        date.setMonth(date.getMonth() + 1);
                        break;
                }
            };

            // Generate intervals until we reach or pass the last date
            while (currentDate <= lastDate) {
                const intervalKey = getIntervalKey(currentDate);
                if (!intervals.includes(intervalKey)) {
                    intervals.push(intervalKey);
                }
                incrementDate(currentDate);
            }


            const lastIntervalKey = getIntervalKey(lastDate);
            if (!intervals.includes(lastIntervalKey)) {
                intervals.push(lastIntervalKey);
            }
            

            // Group calls by interval
            const groupedCalls = new Map<string, typeof validCalls>();
            intervals.forEach(intervalKey => {
                groupedCalls.set(intervalKey, []);
            });

            validCalls.forEach(call => {
                const intervalKey = getIntervalKey(new Date(call.startTime!));
                groupedCalls.get(intervalKey)?.push(call);
            });

            // Process each interval
            const averageDurations: number[] = [];
            const positiveSentimentPercentages: number[] = [];
            const resolvedPercentages: number[] = [];

            for (const intervalKey of intervals) {
                const intervalCalls = groupedCalls.get(intervalKey) || [];

                // Calculate metrics for this interval
                const callDurations = intervalCalls
                    .filter(call => call.endTime)
                    .map(call => {
                        return (new Date(call.endTime!).getTime() - new Date(call.startTime!).getTime()) / (1000 * 60);
                    })
                    .filter(duration => duration > 0);

                const averageDuration = callDurations.length > 0 
                    ? callDurations.reduce((a, b) => a + b, 0) / callDurations.length 
                    : 0;

                const positiveSentimentCount = intervalCalls.filter(
                    call => call.analysis?.ociAnalysis?.documentSentiment === "Positive"
                ).length;

                const resolvedCount = intervalCalls.filter(
                    call => call.analysis?.llmInsights?.se_resolvio
                ).length;

                averageDurations.push(averageDuration);
                positiveSentimentPercentages.push(intervalCalls.length > 0 ? (positiveSentimentCount / intervalCalls.length) * 100 : 0);
                resolvedPercentages.push(intervalCalls.length > 0 ? (resolvedCount / intervalCalls.length) * 100 : 0);
            }

            return {
                intervals,
                averageDurations,
                positiveSentimentPercentages,
                resolvedPercentages
            };
        } catch (err) {
            throw new Error("Error fetching call history: " + err);
        }
    }
}

export default CallController;