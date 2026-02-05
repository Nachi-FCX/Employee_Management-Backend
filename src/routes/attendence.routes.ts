import {attendance} from "../controllers/attendence.controller";
import { TokenValidation } from "../middleware/token.validation.middleware";
import router from "./unifiedAuth.routes";

router.post("/punch",TokenValidation,attendance);

export default router;