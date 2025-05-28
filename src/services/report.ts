import { Report } from "@prisma/client";
import prisma from "../../client";
import HttpException from "../models/http-exception";

class ReportService {
    async getAllReports() {
        try {
            const reports = await prisma.report.findMany({
                include: {
                    project: true,  // Include project details if available
                    reportCalls: {  // Include related calls
                        include: {
                            call: true
                        }
                    }
                }
            });
            return reports;
        } catch (err) {
            if (err instanceof HttpException) {
                throw err;
            }
            throw new HttpException(500, "Error fetching reports: " + err);
        }
    }
}

export default ReportService; 