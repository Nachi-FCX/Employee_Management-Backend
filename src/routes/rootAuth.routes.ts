import { Router } from "express";
import { rootSignup } from "../controllers/rootSignup.controller";
import { createCompany } from "../controllers/companySetup.controller";
import { RootValidation } from "../middleware/root.middleware";

const router = Router();

router.post("/signup", rootSignup);  
router.post("/create-company", RootValidation, createCompany);

export default router;