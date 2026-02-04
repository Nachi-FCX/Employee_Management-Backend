import { Router } from "express";
import { rootSignup } from "../controllers/rootSignup.controller";
import { createCompany, deleteCompany, getCompanies, updateCompany } from "../controllers/company.controller";

import { changepassword } from "../controllers/rootAuth.controller";
import { RootValidation } from "../middleware/root.middleware";

const router = Router();

/**
 * ROOT USER SIGNUP (TEMPORARILY PUBLIC FOR FIRST ROOT USER)
 * POST /api/root/signup
 */
router.post("/signup", rootSignup);  
router.put("/change-password",changepassword);
router.post("/create-company", RootValidation, createCompany);
router.get("/company", RootValidation, getCompanies);
router.put("/company/:id", RootValidation, updateCompany);
router.delete("/company/:id", RootValidation, deleteCompany);


export default router;