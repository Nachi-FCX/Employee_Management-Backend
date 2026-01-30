import { Request, Response } from "express";
import prisma from "../prisma";
import { rootLoginService , employeeLoginService} from "../services/auth.service";



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