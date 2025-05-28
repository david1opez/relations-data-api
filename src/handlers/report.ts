import { Request, Response, NextFunction } from "express";
import ReportController from "../controllers/report";

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
}

export default ReportHandler; 