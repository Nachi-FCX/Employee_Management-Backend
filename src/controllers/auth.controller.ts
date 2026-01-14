import { Request, Response } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import prisma from "../prisma";

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

    // 3. Generate token
    const token = jwt.sign(
      {
        user_id: user.user_id,
        role_id: user.role_id,
      },
      process.env.JWT_SECRET || "secret_key",
      { expiresIn: "1h" }
    );

    res.json({
      message: "Login successful",
      token,
    });
  } catch (error) {
    res.status(500).json({ message: "Login failed", error });
  }
};
