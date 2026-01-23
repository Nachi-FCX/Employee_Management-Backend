import { Request, Response } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import prisma from "../prisma";

export const unifiedLogin = async (req: Request, res: Response) => {
  try {
    const { username, password, role } = req.body;

    if (!username || !password || !role) {
      return res.status(400).json({
        message: "username, password and role are required",
      });
    }

    /**
     * =========================
     * ROOT USER LOGIN
     * =========================
     */
    if (role === "root") {
      const rootUser = await prisma.rootUser.findUnique({
        where: { username },
      });

      if (!rootUser || !rootUser.is_active) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      const isValid = await bcrypt.compare(password, rootUser.password_hash);
      if (!isValid) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      const token = jwt.sign(
        {
          root_user_id: rootUser.id,
          type: "ROOT",
        },
        process.env.JWT_SECRET || "secret_key",
        { expiresIn: "2h" }
      );

      return res.json({
        message: "Root login successful",
        token,
        role: "root",
      });
    }

    /**
     * =========================
     * EMPLOYEE USER LOGIN
     * =========================
     */
    if (role === "employee") {
      const user = await prisma.users.findFirst({
        where: { 
          username,
          company_id: null
        },
        include: {
          employee: true,
          role: true,
          company: true,
        },
      });

      if (!user || !user.is_active) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      const isValid = await bcrypt.compare(password, user.password_hash);
      if (!isValid) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      const token = jwt.sign(
        {
          user_id: user.id,
          employee_id: user.employee_id,
          company_id: user.company_id,
          role: user.role.role_name,
          type: "EMPLOYEE",
        },
        process.env.JWT_SECRET || "secret_key",
        { expiresIn: "1h" }
      );

      return res.json({
        message: "Employee login successful",
        token,
        role: "employee",
        user: {
          username: user.username,
          full_name: `${user.employee.first_name} ${user.employee.last_name}`,
          company: user.company?.company_name || null,
          role: user.role.role_name,
        },
      });
    }

    /**
     * =========================
     * INVALID ROLE
     * =========================
     */
    return res.status(400).json({
      message: "Invalid role. Use 'root' or 'employee'",
    });
  } catch (error) {
    console.error("Unified Login Error:", error);
    return res.status(500).json({ message: "Login failed" });
  }
};
