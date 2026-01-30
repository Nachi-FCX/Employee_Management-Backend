import { Request, Response } from "express";
import bcrypt from "bcrypt";
import prisma from "../prisma";

export const rootSignup = async (req: Request, res: Response) => {
  try {
    const { full_name, username, email, password } = req.body;

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

    // 3. Check if username already exists
    const existingUsername = await prisma.rootUser.findUnique({
      where: { username },
    });

    if (existingUsername) {
      return res.status(409).json({
        message: "Username already exists",
      });
    }

    // 4. Check if email already exists
    const existingEmail = await prisma.rootUser.findUnique({
      where: { email },
    });

    if (existingEmail) {
      return res.status(409).json({
        message: "Email already exists",
      });
    }

    // 5. Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // 6. Create new ROOT user
    const rootUser = await prisma.rootUser.create({
      data: {
        full_name,
        username,
        email,
        password_hash: hashedPassword,
        is_active: true,
      },
    });

    // 7. Response (Don't return password hash)
    res.status(201).json({
      message: "Root user created successfully",
      user: {
        id: rootUser.id,
        full_name: rootUser.full_name,
        username: rootUser.username,
        email: rootUser.email,
        is_active: rootUser.is_active,
        created_at: rootUser.created_at,
      },
    });
  } catch (error) {
    console.error("Root Signup Error:", error);
    res.status(500).json({
      message: "Root user signup failed",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};