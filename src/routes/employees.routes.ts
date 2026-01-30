import { Router } from "express";
import {
  createEmployee,
  getEmployees,
  updateEmployee,
} from "../controllers/employees.controller";
import { TokenValidation } from "../middleware/token.validation.middleware";
import { RootValidation } from "../middleware/root.middleware";
const router = Router();

router.post("/",TokenValidation,RootValidation,createEmployee);
router.get("/", TokenValidation,RootValidation, getEmployees);
router.put("/:id", TokenValidation,RootValidation, updateEmployee);

export default router;
