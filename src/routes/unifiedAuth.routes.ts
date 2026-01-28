// import { Router } from "express";
// import { unifiedLogin } from "../controllers/unifiedAuth.controller";

// const router = Router();
// router.post("/login", unifiedLogin);

// export default router;
import { Router } from "express";
import { unifiedLogin } from "../controllers/unifiedAuth.controller";
import { createCompany } from "../controllers/companySetup.controller";
import { rootAuthMiddleware } from "../middleware/rootAuth.middleware";

const router = Router();

router.post("/login", unifiedLogin);

router.post(
  "/company",
  rootAuthMiddleware,
  createCompany
);

export default router;
