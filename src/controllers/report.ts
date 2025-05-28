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
}

export default ReportController; 