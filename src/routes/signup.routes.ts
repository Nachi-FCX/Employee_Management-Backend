import { Router } from "express";
import {rootSignup} from "../controllers/unifiedAuth.controller";

const router = Router();

router.post("/signup", rootSignup); 

export default router;