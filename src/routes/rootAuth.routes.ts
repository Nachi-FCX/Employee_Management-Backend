import { Router } from "express";
import { rootSignup } from "../controllers/rootSignup.controller";
import { rootAuthMiddleware } from "../middleware/rootAuth.middleware";

const router = Router();

/**
 * ROOT USER SIGNUP (TEMPORARILY PUBLIC FOR FIRST ROOT USER)
 * POST /api/root/signup
 */
router.post("/signup", rootSignup);  // ← REMOVE rootAuthMiddleware temporarily

export default router;
