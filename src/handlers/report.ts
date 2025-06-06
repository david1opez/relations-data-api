import { Request, Response, NextFunction } from "express";
import ReportController from "../controllers/report";
import HttpException from "../models/http-exception";

class ReportHandler {
    private reportController: ReportController;

    constructor() {
        this.reportController = new ReportController();
    }

    public async getAllReports(req: Request, res: Response, next: NextFunction) {
        try {
            const reports = await this.reportController.getAllReports();
            res.status(200).json(reports);
        } catch (err) {
            next(err);
        }
    }

    public async getReportById(req: Request, res: Response, next: NextFunction) {
        try {
            const { id } = req.params;
            
            if (!id || isNaN(parseInt(id))) {
                throw new HttpException(400, 'Valid report ID is required');
            }

            const report = await this.reportController.getReportById(parseInt(id));
            res.status(200).json(report);
        } catch (err) {
            next(err);
        }
    }

    public async createReport(req: Request, res: Response, next: NextFunction) {
        try {
            const { reportType, fileURL, projectID } = req.body;

            if (!reportType || !fileURL || !projectID) {
                throw new HttpException(400, 'Missing required fields: reportType, fileURL, or projectID');
            }

            const newReport = await this.reportController.createReport({ reportType, fileURL, projectID });
            res.status(201).json(newReport);
        } catch (err) {
            next(err);
        }
    }

    public async getReportsByProjectId(req: Request, res: Response, next: NextFunction) {
        try {
            const { projectId } = req.params;

            if (!projectId || isNaN(parseInt(projectId as string))) {
                throw new HttpException(400, 'Valid project ID is required');
            }

            const reports = await this.reportController.getReportsByProjectId(parseInt(projectId as string));
            res.status(200).json(reports);
        } catch (err) {
            next(err);
        }
    }
}

export default ReportHandler; 