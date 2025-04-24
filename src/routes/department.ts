// src/routes/department.ts
import { Router } from "express";
import DepartmentHandler from "../handlers/department";

const router = Router();
const h = new DepartmentHandler();

// GET    /department/                → lista todos
router.get("/", h.getAll.bind(h));

// POST   /department/                → crea uno nuevo
router.post("/", h.create.bind(h));

// DELETE /department/:departmentID   → elimina por ID
router.delete("/:departmentID", h.remove.bind(h));

export default router;


