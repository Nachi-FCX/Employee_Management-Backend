import { Router } from "express";
import { unifiedLogin } from "../controllers/unifiedAuth.controller";

const router = Router();

/**
 * ✅ UNIFIED LOGIN - Root and Employee
 * POST /api/login
 * 
 * Request Body:
 * {
 *   "username": "your_username",
 *   "password": "your_password",
 *   "role": "root" // or "employee"
 * }
 */
router.post("/login", unifiedLogin);



export default router;
