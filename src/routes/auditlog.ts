import { Router } from "express"
import AuditLogHandler from "../handlers/auditlog"

const router = Router()
const auditLogHandler = new AuditLogHandler()


router.post("/", auditLogHandler.createAuditLog.bind(auditLogHandler))
router.get("/", auditLogHandler.getAllAuditLogs.bind(auditLogHandler))
router.get("/user/:userID", auditLogHandler.getAuditLogsByUser.bind(auditLogHandler))
router.get("/project/:projectID", auditLogHandler.getAuditLogsByProject.bind(auditLogHandler))

export default router
