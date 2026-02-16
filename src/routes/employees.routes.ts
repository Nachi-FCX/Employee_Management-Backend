import { Router } from "express";
import {
  createEmployee,
  getEmployees,
  updateEmployee,
  changepassword
} from "../controllers/employees.controller";
import { TokenValidation } from "../middleware/token.validation.middleware";
import { RootValidation } from "../middleware/root.middleware";
const router = Router();

router.post("/",RootValidation,createEmployee);
router.get("/", RootValidation, getEmployees);
router.put("/:id",RootValidation, updateEmployee);
router.put("/change-password",TokenValidation,changepassword);


export default router;
