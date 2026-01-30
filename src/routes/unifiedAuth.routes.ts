import { Router } from "express";
import { unifiedLogin } from "../controllers/unifiedAuth.controller";

const router = Router();

router.post("/login", unifiedLogin);



export default router;
