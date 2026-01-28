import { Request, Response } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import prisma from "../prisma";

export const unifiedLogin = async (req: Request, res: Response) => {
  try {
    const { username, password, role } = req.body;
    
    if (!username || !password || !role) {
      return res.status(400).json({
        message: "Username, password, and role are required fields",
      });
    }

    const JWT_SECRET = process.env.JWT_SECRET;
    if (!JWT_SECRET) {
      throw new Error("JWT_SECRET is not defined in environment variables");
    }

    if (role === "root") {                                                          // ROOT LOGIN                           
      const rootUser = await prisma.rootUser.findUnique({
        where: { username },
      });

      if (!rootUser || !rootUser.is_active) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      const isPasswordValid = await bcrypt.compare(password, rootUser.password_hash);
      if (!isPasswordValid) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      const token = jwt.sign(
        {
          root_user_id: rootUser.id,
          type: "ROOT", 
        },
        JWT_SECRET,
        { expiresIn: "2h" }
      );

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

    if (role === "employee") {                                                            // EMPLOYEE LOGIN               
      const userAccount = await prisma.users.findFirst({
        where: { username },
        include: {
          employee: true,
          role: true,
          company: true,
        },
      });

        
      if (!userAccount || !userAccount.is_active) {
        return res.status(401).json({ message: "Invalid credentials" });
      }
 
      const isPasswordValid = await bcrypt.compare(password, userAccount.password_hash);
      if (!isPasswordValid) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

 
      const token = jwt.sign(
        {
          user_id: userAccount.id,
          employee_id: userAccount.employee_id,
          company_id: userAccount.company_id,
          role: userAccount.role.role_name,
          type: "EMPLOYEE",
        },
        JWT_SECRET,
        { expiresIn: "8h" }  
      );

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