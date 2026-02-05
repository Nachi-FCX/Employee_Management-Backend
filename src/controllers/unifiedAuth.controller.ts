import { Request, Response } from "express";
import prisma from "../prisma";
import { rootLoginService , employeeLoginService} from "../services/auth.service";
import { generateToken } from "../services/auth.service"; 
import bcrypt from "bcrypt";

export const unifiedLogin = async (req: Request, res: Response) => {
  try {
    const { username, password, role } = req.body;
    if (!username || !password || !role) {
      return res.status(400).json({
        message: "Username, password, and role are required fields",
      });
    }

  if (role === "root") {
    const { rootUser, token } = await rootLoginService(username, password, prisma);

    return res.status(200).json({
      message: "Root login successful",
      token,
      role: "root",
      user: {
        id: rootUser.id,
        username: rootUser.username,
        full_name: rootUser.full_name,
     },
     });
  }

  if (role === "employee") {
  const { userAccount, token } = await employeeLoginService(username, password, prisma);

  return res.status(200).json({
    message: "Employee login successful",
    token,
    role: "employee",
    user: {
      username: userAccount.username,
      full_name: `${userAccount.employee.first_name} ${userAccount.employee.last_name}`,
      company: userAccount.company?.company_name || "Internal",
      role: userAccount.role.role_name,
    },
  });
}

 
    return res.status(400).json({
      message: "Invalid role provided. Access denied.",
    });

  } catch (error) {
    console.error("Critical Login Error:", error);
    return res.status(500).json({
      message: "An internal server error occurred during login",
    });
  }
};



export const rootSignup = async (req: Request, res: Response) => {
  try {
    const { full_name, username, email, password } = req.body;

    /* ---------------- Validation ---------------- */
    if (!full_name || !username || !email || !password) {
      return res.status(400).json({
        message: "full_name, username, email, and password are all required",
      });
    }

    if (password.length < 8) {
      return res.status(400).json({
        message: "Password must be at least 8 characters long",
      });
    }
    if (!/[A-Z]/.test(password)) {
      return res.status(400).json({
        message: "Password must contain at least one uppercase letter",
      });
    }
    if (!/\d/.test(password)) {
      return res.status(400).json({
        message: "Password must contain at least one number",
      });
    }

    /* ---------------- Duplicate checks ---------------- */
    const existingUsername = await prisma.rootUser.findUnique({
      where: { username },
    });

    if (existingUsername) {
      return res.status(409).json({
        message: "Username already exists",
      });
    }

    const existingEmail = await prisma.rootUser.findUnique({
      where: { email },
    });

    if (existingEmail) {
      return res.status(409).json({
        message: "Email already exists",
      });
    }

    /* ---------------- Create user ---------------- */
    const hashedPassword = await bcrypt.hash(password, 10);

    const rootUser = await prisma.rootUser.create({
      data: {
        full_name,
        username,
        email,
        password_hash: hashedPassword,
        is_active: true,
      },
    });

    /* ---------------- JWT TOKEN (USING SHARED UTILITY) ---------------- */
    const token = generateToken(
      {
        root_user_id: rootUser.id,
        type: "ROOT",
        companyCompleted: false,
      },
      "2h"
    );

    /* ---------------- Response ---------------- */
    return res.status(201).json({
      message: "Root user created successfully",
      token,
      user: {
        id: rootUser.id,
        full_name: rootUser.full_name,
        username: rootUser.username,
        email: rootUser.email,
      },
    });
  } catch (error) {
    console.error("Root Signup Error:", error);
    return res.status(500).json({
      message: "Root user signup failed",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};