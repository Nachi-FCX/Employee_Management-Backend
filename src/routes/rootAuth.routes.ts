import { Router } from "express";
import { rootSignup } from "../controllers/rootSignup.controller";
import { changepassword } from "../controllers/rootAuth.controller";

const router = Router();

/**
 * ROOT USER SIGNUP (TEMPORARILY PUBLIC FOR FIRST ROOT USER)
 * POST /api/root/signup
 */
router.post("/signup", rootSignup);  
router.put("/change-password",changepassword);
export default router;