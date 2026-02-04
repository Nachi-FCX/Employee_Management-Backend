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

export const getCompanies = async (req: Request, res: Response) => {
  try {
    const rootUser = (req as any).rootUser;

    if (!rootUser) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const companies = await prisma.companies.findMany({
      where: {
        root_user_id: rootUser.root_user_id,
        status: "active",
      },
      orderBy: {
        created_at: "desc",
      },
    });

    return res.status(200).json({ companies });
  } catch (error) {
    console.error("Get companies error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const updateCompany = async (req: Request, res: Response) => {
  try {
    const rootUser = (req as any).rootUser;
    const { id } = req.params;

    if (!rootUser) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const company = await prisma.companies.findFirst({
      where: {
        id: Number(id),
        root_user_id: rootUser.root_user_id,
        status: "active",
      },
    });

    if (!company) {
      return res.status(404).json({ message: "Company not found" });
    }

    const {
      company_name,
      company_code,
      contact_email,
      industry,
    } = req.body;

    const updatedCompany = await prisma.companies.update({
      where: { id: Number(id) },
      data: {
        company_name,
        company_code,
        contact_email,
        industry,
      },
    });

    return res.status(200).json({
      message: "Company updated successfully",
      company: updatedCompany,
    });
  } catch (error) {
    console.error("Update company error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};
           
export const deleteCompany = async (req: Request, res: Response) => {
  try {
    const rootUser = (req as any).rootUser;
    const { id } = req.params;
    const companyId = Number(id);

    if (!rootUser) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const company = await prisma.companies.findFirst({                // fech the company to be deleted
      where: {
        id: companyId,
        root_user_id: rootUser.root_user_id,
        status: "active",
      },
    });

    if (!company) {
      return res.status(404).json({ message: "Company not found" });
    }

    const employeeCount = await prisma.employees.count({                  // check if employees exist under this company
      where: {
        company_id: companyId,
        status: true, 
      },
    });

    if (employeeCount > 0) {
      return res.status(400).json({
        message: "Cannot delete company. Employees exist under this company.",
      });
    }

    await prisma.companies.update({                     // soft delete the company by updating its status
      where: { id: companyId },
      data: {
        status: "inactive",
        is_active: false,
      },
    });

    return res.status(200).json({
      message: "Company deleted successfully",
    });
  } catch (error) {
    console.error("Delete company error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};
