import CallService from "../services/call";

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
            return calls;
        } catch (err) {
            throw new Error("Error fetching calls: " + err);
        }
    }

    async getCall(callID: number) {
        try {        
            const call = await this.callService.getCall(callID);

            if (call.summary) {
                call.summary = this.parseVTT(call.summary); 
            }

            return call;
        } catch (err) {
            throw new Error("An error occurred while fetching the call: " + err);
        }
    }
}

export default CallController;