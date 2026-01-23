import { Router } from "express";
import {
  createEmployee,
  getEmployees,
  updateEmployee,
  deleteEmployee,
} from "../controllers/employees.controller";
// Remove this line: import { authMiddleware } from "../middleware/auth.middleware";

const router = Router();

// Remove authMiddleware from all routes:
router.post("/", createEmployee);           // was: authMiddleware, createEmployee
router.get("/", getEmployees);              // was: authMiddleware, getEmployees
router.put("/:id", updateEmployee);         // was: authMiddleware, updateEmployee
router.delete("/:id", deleteEmployee);      // was: authMiddleware, deleteEmployee

export default router;
