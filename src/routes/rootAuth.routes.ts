import { Router } from "express";
import { rootSignup } from "../controllers/rootSignup.controller";

const router = Router();

/**
 * ROOT USER SIGNUP 
 * POST /api/root/signup
 */
router.post("/signup", rootSignup);  

export default router;