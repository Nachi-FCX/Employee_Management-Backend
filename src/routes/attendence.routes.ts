import {attendance, Logs, fullLogs } from "../controllers/attendence.controller";
import { TokenValidation } from "../middleware/token.validation.middleware";
import { RootValidation } from "../middleware/root.middleware";
import router from "./unifiedAuth.routes";

router.post("/punch",TokenValidation,attendance);
router.get("/logs", TokenValidation, Logs);
router.get("/full-logs", RootValidation, fullLogs);

export default router;