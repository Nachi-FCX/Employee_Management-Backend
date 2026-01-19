import { Request, Response } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import prisma from "../prisma";

/**
 * =========================
 * SIGNUP / REGISTER USER
 * =========================
 * Input:
 * full_name, username, email, phone, password
 */
export const signup = async (req: Request, res: Response) => {
  try {
    const { full_name, username, email, phone, password } = req.body;

    // 1. Validate input
    if (!full_name || !username || !email || !phone || !password) {
      return res.status(400).json({
        message: "All fields are required",
      });
    }

    // 2. Split full name into first & last name
    const nameParts = full_name.trim().split(" ");
    const first_name = nameParts[0];
    const last_name = nameParts.slice(1).join(" ") || "";

    // 3. Check if username already exists
    const existingUser = await prisma.users.findUnique({
      where: { username },
    });

    if (existingUser) {
      return res.status(409).json({
        message: "Username already exists",
      });
    }

    // 4. Create Employee (auto-created during signup)
    const employee = await prisma.employees.create({
      data: {
        employee_code: `EMP${Date.now()}`,
        first_name,
        last_name,
        email,
        phone,
        gender: "Not Specified",
        date_of_birth: new Date("2000-01-01"),
        join_date: new Date(),
        salary: 0,
        department_id: 1, // default department
        role_id: 1, // default role (Employee)
        status: "Active",
      },
    });

    // 5. Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // 6. Create User linked to Employee
    const user = await prisma.users.create({
      data: {
        username,
        password_hash: hashedPassword,
        employee_id: employee.employee_id,
        role_id: 1, // default role
        is_active: true,
      },
    });

    // 7. Success response
    res.status(201).json({
      message: "Signup successful",
      user_id: user.user_id,
      employee_id: employee.employee_id,
    });
  } catch (error) {
    console.error("Signup Error:", error);
    res.status(500).json({
      message: "Signup failed",
      error,
    });
  }
};

/**
 * =========================
 * LOGIN USER
 * =========================
 */
export const login = async (req: Request, res: Response) => {
  try {
    const { username, password } = req.body;

    // 1. Check user exists
    const user = await prisma.users.findUnique({
      where: { username },
    });

    if (!user || !user.is_active) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // 2. Compare password
    const isPasswordValid = await bcrypt.compare(
      password,
      user.password_hash
    );

    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // 3. Generate JWT token
    const token = jwt.sign(
      {
        user_id: user.user_id,
        role_id: user.role_id,
      },
      process.env.JWT_SECRET || "secret_key",
      { expiresIn: "1h" }
    );

    // 4. Success response
    res.json({
      message: "Login successful",
      token,
    });
  } catch (error) {
    console.error("Login Error:", error);
    res.status(500).json({
      message: "Login failed",
    });
  }
};
