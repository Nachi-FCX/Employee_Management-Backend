import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const createCompany = async (req: Request, res: Response) => {
  try {
    
    const rootUser = (req as any).rootUser;

    if (!rootUser) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const {
      company_name,
      company_code,
      contact_email,
      industry,
    } = req.body;

    if (!company_name || !company_code || !contact_email) {
      return res.status(400).json({
        message: "company_name, company_code and contact_email are required",
      });
    }
    const exists = await prisma.companies.findFirst({
      where: {
        OR: [
          { company_code },
          { contact_email },
        ],
      },
    });

    if (exists) {
      return res.status(409).json({
        message: "Company already exists with same code or email",
      });
    }

    const company = await prisma.companies.create({
      data: {
        company_name,
        company_code,
        contact_email,
        industry,
        root_user_id: rootUser.root_user_id,
      },
    });

    return res.status(201).json({
      message: "Company created successfully",
      company,
    });
  } catch (error) {
    console.error("Create company error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};
