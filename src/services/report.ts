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

    async getReportById(reportID: number) {
        try {
            const report = await prisma.report.findUnique({
                where: { reportID },
                include: {
                    project: {
                        select: {
                            projectID: true,
                            name: true,
                            description: true,
                            problemDescription: true,
                            reqFuncionales: true,
                            reqNoFuncionales: true,
                            startDate: true,
                            endDate: true,
                            clientEmail: true
                        }
                    },
                    reportCalls: {
                        include: {
                            call: {
                                select: {
                                    callID: true,
                                    title: true,
                                    startTime: true,
                                    endTime: true,
                                    summary: true,
                                    projectID: true
                                }
                            }
                        }
                    }
                }
            });

            if (!report) {
                throw new HttpException(404, `Report with ID ${reportID} not found`);
            }

            // Asegurar que las fechas estén en formato ISO
            const formattedReport = {
                ...report,
                generatedAt: report.generatedAt?.toISOString() || null,
                project: report.project ? {
                    ...report.project,
                    startDate: report.project.startDate?.toISOString() || null,
                    endDate: report.project.endDate?.toISOString() || null
                } : undefined,
                reportCalls: report.reportCalls.map(rc => ({
                    ...rc,
                    startTime: rc.startTime?.toISOString() || null,
                    endTime: rc.endTime?.toISOString() || null,
                    call: {
                        ...rc.call,
                        startTime: rc.call.startTime?.toISOString() || null,
                        endTime: rc.call.endTime?.toISOString() || null
                    }
                }))
            };

            return formattedReport;
        } catch (err) {
            if (err instanceof HttpException) {
                throw err;
            }
            throw new HttpException(500, `Error fetching report: ${err}`);
        }
    }
}

export default ReportService; 