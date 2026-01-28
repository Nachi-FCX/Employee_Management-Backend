import { Router } from "express";
import {
  createEmployee,
  getEmployees,
  updateEmployee,
} from "../controllers/employees.controller";
import { unifiedAuth } from "../middleware/auth.middleware";

const router = Router();

router.post("/", unifiedAuth, createEmployee);
router.get("/", unifiedAuth, getEmployees);
router.put("/:id", unifiedAuth, updateEmployee);

export default router;
