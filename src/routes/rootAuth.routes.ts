import { Router } from "express";
import { rootSignup } from "../controllers/rootSignup.controller";
import { createCompany, deleteCompany, getCompanies, updateCompany } from "../controllers/company.controller";
import { RootValidation } from "../middleware/root.middleware";

const router = Router();

router.post("/signup", rootSignup);  
router.post("/create-company", RootValidation, createCompany);
router.get("/company", RootValidation, getCompanies);
router.put("/company/:id", RootValidation, updateCompany);
router.delete("/company/:id", RootValidation, deleteCompany);

export default router;