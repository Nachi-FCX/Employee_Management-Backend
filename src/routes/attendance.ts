import { Router } from "express";
import authMiddleware from "../middleware/authMiddleware";
import {
  checkIn,
  checkOut,
  myAttendance
} from "../controllers/attendanceController";

const router = Router();

router.post("/check-in", authMiddleware, checkIn);
router.post("/check-out", authMiddleware, checkOut);
router.get("/me", authMiddleware, myAttendance);

export default router;
