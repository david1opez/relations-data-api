import { Router } from "express";
import { ReportHandler } from "../handlers/report"; 

const router = Router();
const reportHandler = new ReportHandler();

router.get("/reports", reportHandler.getAllReports.bind(reportHandler));
router.get("/reports/:id", reportHandler.getReportById.bind(reportHandler));

export default router; 