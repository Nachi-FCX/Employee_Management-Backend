import express from "express";
import cors from "cors";

import rolesRoutes from "./routes/roles.routes";
import employeesRoutes from "./routes/employees.routes";
import authRoutes from "./routes/auth.routes";

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/roles", rolesRoutes);
app.use("/api/employees", employeesRoutes);
app.use("/api/auth", authRoutes);

app.get("/", (_req, res) => {
  res.send("Employee Management Backend Running 🚀");
});

export default app;
