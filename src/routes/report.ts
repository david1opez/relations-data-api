import { Router } from "express";
import ReportHandler from "../handlers/report";

const router = Router();
const reportHandler = new ReportHandler();

router.get("/reports", reportHandler.getAllReports.bind(reportHandler));
router.get("/reports/:id", reportHandler.getReportById.bind(reportHandler));
router.post("/reports", reportHandler.createReport.bind(reportHandler));

// Nueva ruta para obtener reportes por projectID
router.get("/reports/byProject/:projectId", reportHandler.getReportsByProjectId.bind(reportHandler));

export default router; 