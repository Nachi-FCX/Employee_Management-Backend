import { Router } from "express";
import { rootSignup } from "../controllers/rootSignup.controller";
import { rootAuthMiddleware } from "../middleware/rootAuth.middleware";

const router = Router();

router.post("/signup", rootSignup);  

export default router;
