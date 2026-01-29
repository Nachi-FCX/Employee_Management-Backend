import { Router } from "express";
import { rootSignup } from "../controllers/rootSignup.controller";
import { createCompany } from "../controllers/companySetup.controller";
import { unifiedAuth } from "../middleware/auth.middleware"; 

const router = Router();

router.post("/signup", rootSignup);  
router.post("/create-company", unifiedAuth, createCompany);

export default router;