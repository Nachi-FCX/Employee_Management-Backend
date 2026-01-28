import { Router } from "express";
import {
  createEmployee,
  getEmployees,
  updateEmployee,
} from "../controllers/employees.controller";

const router = Router();

router.post("/", createEmployee);           // was: authMiddleware, createEmployee
router.get("/", getEmployees);              // was: authMiddleware, getEmployees
router.put("/:id", updateEmployee);         // was: authMiddleware, updateEmployee

export default router;
