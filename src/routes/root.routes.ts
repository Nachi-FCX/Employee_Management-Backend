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


const router = Router();

router.put("/change-password",changepassword);

router.post("/create-company",  createCompany);
router.get("/company",  getCompanies);
router.put("/company/:id",  updateCompany);
router.delete("/company/:id",  deleteCompany);

router.get("/get-roles/:company_id",  getRolesByCompany);
router.post("/create-role",  createRole);
router.put("/update-role/:id",  updateRole);
router.delete("/delete-role/:id",  deleteRole);

router.post("/create-department",  createDepartment);
router.get("/get-departments/:company_id",  getDepartmentsByCompany);
router.put("/update-department/:id",  updateDepartment);
router.delete("/delete-department/:id",  deleteDepartment);



export default router;