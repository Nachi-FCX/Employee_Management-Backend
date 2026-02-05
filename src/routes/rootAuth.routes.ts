import { Router } from "express";
import { rootSignup } from "../controllers/rootSignup.controller";

import { changepassword, getCompanies } from "../controllers/rootAuth.controller";
import { createCompany } from "../controllers/companySetup.controller";
import { RootValidation } from "../middleware/root.middleware";

const router = Router();

/**
 * ROOT USER SIGNUP (TEMPORARILY PUBLIC FOR FIRST ROOT USER)
 * POST /api/root/signup
 */
router.post("/signup", rootSignup);  
router.put("/change-password",changepassword);
router.post("/create-company", RootValidation, createCompany);
router.get("/getcompanies",RootValidation,getCompanies);


export default router;