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
}

export default ReportController; 