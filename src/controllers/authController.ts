import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import pool from "../config/db";

const JWT_SECRET = process.env.JWT_SECRET as string;

export const login = async (req: Request, res: Response): Promise<void> => {
  const { username, password } = req.body;

  if (!username || !password) {
    res.status(400).json({ message: "Username and password required" });
    return;
  }

  try {
    // Fetch user + employee status
    const result = await pool.query(
      `
      SELECT 
        u.id AS user_id,
        u.username,
        u.password_hash,
        u.is_active,
        u.role_id,
        u.employee_id,
        e.status AS employee_status
      FROM "Employee_management".users u
      JOIN "Employee_management".employees e
        ON u.employee_id = e.id
      WHERE u.username = $1
      `,
      [username]
    );

    if (result.rows.length === 0) {
      res.status(401).json({ message: "Invalid credentials" });
      return;
    }

    const user = result.rows[0];

    // Employee inactive (soft delete)
    if (!user.employee_status) {
      res.status(403).json({ message: "Employee is inactive" });
      return;
    }

    // User account disabled
    if (!user.is_active) {
      res.status(403).json({ message: "User account is disabled" });
      return;
    }

    // Password verification
    const isMatch = await bcrypt.compare(password, user.password_hash);

    if (!isMatch) {
      res.status(401).json({ message: "Invalid credentials" });
      return;
    }

    // JWT
    const token = jwt.sign(
      {
        userId: user.user_id,
        employeeId: user.employee_id,
        roleId: user.role_id
      },
      JWT_SECRET,
      { expiresIn: "1h" }
    );

   
    res.json({
      message: "Login successful",
      token
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};
