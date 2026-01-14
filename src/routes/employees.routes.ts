import { Router } from "express";
import {
  createEmployee,
  getEmployees,
  updateEmployee,
  deleteEmployee,
} from "../controllers/employees.controller";

const router = Router();

router.post("/", createEmployee);
router.get("/", getEmployees);
router.put("/:id", updateEmployee);
router.delete("/:id", deleteEmployee);

export default router;
