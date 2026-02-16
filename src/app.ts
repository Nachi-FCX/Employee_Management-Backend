import express from "express";
import cors from "cors";


import employeesRoutes from "./routes/employees.routes";
import rootAuthRoutes from "./routes/root.routes";
import attendenceRouthes from "./routes/attendence.routes";
import unifiedAuthRoutes from "./routes/unifiedAuth.routes";
import { RootValidation } from "./middleware/root.middleware";

const app = express();

app.use(cors());
app.use(express.json());
app.use("/api", unifiedAuthRoutes);        
app.use("/api/root", RootValidation, rootAuthRoutes);      
app.use("/api/employees", employeesRoutes);
app.use("/api/attendence", attendenceRouthes);


app.get("/", (_req, res) => {
  res.send("Employee Management Backend Running 🚀");
});
export default app;
