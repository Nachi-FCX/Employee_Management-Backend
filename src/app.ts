import express from "express";
import cors from "cors";

// USER MODULES
import employeesRoutes from "./routes/employees.routes";

// ROOT MODULES
import rootAuthRoutes from "./routes/rootAuth.routes";

//  UNIFIED LOGIN MODULE
import unifiedAuthRoutes from "./routes/unifiedAuth.routes";

const app = express();

// ================= Middleware =================
app.use(cors());
app.use(express.json());

// ================= UNIFIED LOGIN =================
app.use("/api", unifiedAuthRoutes);        // POST /api/login

// ================= ROOT APIs =================
app.use("/api/root", rootAuthRoutes);      // POST /api/root/signup
 

// ================= BUSINESS APIs =================
app.use("/api/employees", employeesRoutes);

// ================= HEALTH CHECK =================
app.get("/", (_req, res) => {
  res.send("Employee Management Backend Running 🚀");
});
export default app;
