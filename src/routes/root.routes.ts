import { Router } from "express";
import { changepassword } from "../controllers/root.controller";
import { createCompany, deleteCompany, getCompanies, updateCompany } from "../controllers/company.controller";
import { RootValidation } from "../middleware/root.middleware";
import {rootSignup} from "../controllers/unifiedAuth.controller";

const router = Router();

router.post("/signup", rootSignup);  
router.put("/change-password",changepassword);
router.post("/create-company", RootValidation, createCompany);
router.get("/company", RootValidation, getCompanies);
router.put("/company/:id", RootValidation, updateCompany);
router.delete("/company/:id", RootValidation, deleteCompany);


export default router;