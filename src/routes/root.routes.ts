import { Router } from "express";
import { changepassword } from "../controllers/root.controller";
import { 
    createCompany,
    deleteCompany,
    getCompanies,
    getRolesByCompany,
    updateCompany,
    createRole,
    deleteRole,
    updateRole,
    createDepartment,
    getDepartmentsByCompany,
    updateDepartment,   
    deleteDepartment

      } from "../controllers/company.controller";
import { RootValidation } from "../middleware/root.middleware";
import {rootSignup} from "../controllers/unifiedAuth.controller";

const router = Router();

router.post("/signup", rootSignup);  
router.put("/change-password",changepassword);

router.post("/create-company", RootValidation, createCompany);
router.get("/company", RootValidation, getCompanies);
router.put("/company/:id", RootValidation, updateCompany);
router.delete("/company/:id", RootValidation, deleteCompany);

router.get("/get-roles/:company_id", RootValidation, getRolesByCompany);
router.post("/create-role", RootValidation, createRole);
router.put("/update-role/:id", RootValidation, updateRole);
router.delete("/delete-role/:id", RootValidation, deleteRole);

router.post("/create-department", RootValidation, createDepartment);
router.get("/get-departments/:company_id", RootValidation, getDepartmentsByCompany);
router.put("/update-department/:id", RootValidation, updateDepartment);
router.delete("/delete-department/:id", RootValidation, deleteDepartment);



export default router;