import { Request, Response } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import prisma from "../prisma";

/**
 * =========================
 * NORMAL USER LOGIN
 * =========================
 * Used by employees created by ROOT
 */
export const login = async (req: Request, res: Response) => {
  try {
    const { username, password, company_id } = req.body;

    // 1. Validate input
    if (!username || !password || !company_id) {
      return res.status(400).json({
        message: "Username, password, and company_id are required",
      });
    }

    // 2. Find user with relations
    const user = await prisma.users.findUnique({
      where: {
        company_id_username: {
          company_id: parseInt(company_id),
          username: username,
        },
      },
      include: {
        role: true,
        employee: true,
        company: true,
      },
    });

    if (!user || !user.is_active) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // 3. Compare password
    const isPasswordValid = await bcrypt.compare(
      password,
      user.password_hash
    );

    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // 4. Generate JWT
    const token = jwt.sign(
      {
        user_id: user.id,
        company_id: user.company_id,
        employee_id: user.employee_id,
        role_id: user.role_id,
        type: "USER",
      },
      process.env.JWT_SECRET || "secret_key",
      { expiresIn: "1h" }
    );

    // 5. Response
    res.json({
      message: "Login successful",
      token,
      user: {
        username: user.username,
        role: user.role.role_name,
        company: user.company?.company_name || "",
        full_name: `${user.employee.first_name} ${user.employee.last_name}`,
      },
    });
  } catch (error) {
    console.error("Login Error:", error);
    res.status(500).json({ message: "Login failed" });
  }
};
