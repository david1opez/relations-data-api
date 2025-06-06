import ReportService from "../services/report";
import { Report } from "@prisma/client";

class ReportController {
    private reportService: ReportService;

    constructor() {
        this.reportService = new ReportService();
    }

    async getAllReports(): Promise<Report[]> {
        return this.reportService.getAllReports();
    }

    async getReportById(reportID: number) {
        return this.reportService.getReportById(reportID);
    }

    async createReport(data: { reportType: string, fileURL: string, projectID: number }): Promise<Report> {
        return this.reportService.createReport(data);
    }

    async getReportsByProjectId(projectId: number): Promise<Report[]> {
        return this.reportService.getReportsByProjectId(projectId);
    }
}

export default ReportController; 