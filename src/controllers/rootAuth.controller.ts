import { Request, Response } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import prisma from "../prisma";

/**
 * =========================
 * ROOT USER LOGIN
 * =========================
 */
export const rootLogin = async (req: Request, res: Response) => {
  try {
    const { username, password } = req.body;

    // 1. Validate input
    if (!username || !password) {
      return res.status(400).json({
        message: "Username and password are required",
      });
    }

    // 2. Find root user
    const rootUser = await prisma.rootUser.findUnique({
      where: { username },
    });

    if (!rootUser || !rootUser.is_active) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // 3. Compare password
    const isPasswordValid = await bcrypt.compare(
      password,
      rootUser.password_hash
    );

    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // 4. CREATE ROOT JWT TOKEN ✅ (THIS WAS MISSING)
    const token = jwt.sign(
      {
        root_user_id: rootUser.id,
        type: "ROOT",
      },
      process.env.JWT_SECRET || "secret_key",
      { expiresIn: "2h" }
    );

    // 5. Update last login (optional but good)
    await prisma.rootUser.update({
      where: { id: rootUser.id },
      data: {
        last_login: new Date(),
      },
    });

    // 6. Response
    res.json({
      message: "Root login successful",
      token,
    });
  } catch (error) {
    console.error("Root Login Error:", error);
    res.status(500).json({
      message: "Root login failed",
    });
  }
};
