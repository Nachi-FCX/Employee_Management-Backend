import { Request, Response } from "express";
import { Prisma } from "@prisma/client";
import bcrypt from "bcrypt";
import prisma from "../prisma";

export const createEmployee = async (req: Request, res: Response) => {                                      // CREATE EMPLOYEE + USER
  try {
    // Logged-in user (root/admin/hr)
    const user = (req as any).user;

    if (!user || !user.company_id) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const company_id = user.company_id;

    const {
      first_name,
      last_name,
      email,
      department_id,
      role_id,
      salary,
      username,
      password,
    } = req.body;

    if (
      !first_name ||
      !email ||
      !department_id ||
      !role_id ||
      !username ||
      !password
    ) {
      return res.status(400).json({
        message:
          "first_name, email, department_id, role_id, username, password are required",
      });
    }

    const department = await prisma.departments.findUnique({
      where: { department_id: Number(department_id) },
    });

    if (!department) {
      return res.status(404).json({ message: "Department not found" });
    }

    const role = await prisma.roles.findUnique({
      where: { role_id: Number(role_id) },
    });

    if (!role) {
      return res.status(404).json({ message: "Role not found" });
    }

    const company = await prisma.companies.findUnique({
      where: { id: company_id },
    });

    if (!company) {
      return res.status(404).json({ message: "Company not found" });
    }

    const employeeCount = await prisma.employees.count({
      where: { company_id },
    });

    const employee_code =
      company.company_code + String(employeeCount + 1).padStart(4, "0");

    const password_hash = await bcrypt.hash(password, 10);

    // 7️⃣ Transaction (Employee + User)
    const result = await prisma.$transaction(async (tx) => {
      //  Create employee
      const employee = await tx.employees.create({
        data: {
          company_id,
          employee_code,
          first_name,
          last_name: last_name || "",
          email,
          phone: "",
          gender: "Unknown",
          date_of_birth: new Date("2000-01-01"),
          join_date: new Date(),
          salary: new Prisma.Decimal(salary ?? "0.00"),
          department_id: Number(department_id),
          role_id: Number(role_id),
          status: true,
        },
      });

      //  Create user login
      const userAccount = await tx.users.create({
        data: {
          company_id,
          employee_id: employee.id,
          username,
          password_hash,
          role_id: Number(role_id),
          is_active: true,
        },
      });

      return { employee, userAccount };
    });

    return res.status(201).json({
      message: "Employee created successfully",
      employee: result.employee,
      user: result.userAccount,
    });
  } catch (error) {
    console.error("CREATE EMPLOYEE ERROR:", error);
    return res.status(500).json({
      message: "Error creating employee",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};


export const getEmployees = async (req: Request, res: Response) => {                                    // GET EMPLOYEES                    
  try {
    const user = (req as any).user;

    if (!user || !user.company_id) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const company_id = user.company_id;

    const employees = await prisma.employees.findMany({
      where: { company_id },
      include: {
        role: true,
        department: true,
      },
      orderBy: {
        created_at: "desc",
      },
    });

    res.status(200).json({
      total: employees.length,
      employees,
    });
  } catch (error) {
    console.error("GET EMPLOYEES ERROR:", error);
    res.status(500).json({
      message: "Error fetching employees",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};


export const updateEmployee = async (req: Request, res: Response) => {                                    // UPDATE EMPLOYEE
  try {
    const id = Number(req.params.id);

    if (!id) {
      return res.status(400).json({ message: "Employee ID is required" });
    }

    const updateData: any = {};

    if (req.body.first_name !== undefined)
      updateData.first_name = req.body.first_name;
    if (req.body.last_name !== undefined)
      updateData.last_name = req.body.last_name;
    if (req.body.email !== undefined)
      updateData.email = req.body.email;
    if (req.body.phone !== undefined)
      updateData.phone = req.body.phone;
    if (req.body.gender !== undefined)
      updateData.gender = req.body.gender;
    if (req.body.date_of_birth !== undefined)
      updateData.date_of_birth = new Date(req.body.date_of_birth);
    if (req.body.join_date !== undefined)
      updateData.join_date = new Date(req.body.join_date);
    if (req.body.salary !== undefined)
      updateData.salary = new Prisma.Decimal(req.body.salary);
    if (req.body.department_id !== undefined)
      updateData.department_id = Number(req.body.department_id);
    if (req.body.role_id !== undefined)
      updateData.role_id = Number(req.body.role_id);
    if (req.body.status !== undefined)                                                                    // SOFT DELETE EMPLOYEE
      updateData.status = req.body.status;

    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({ message: "No fields to update" });
    }

    const employee = await prisma.employees.update({
      where: { id },
      data: updateData,
      include: {
        role: true,
        department: true,
      },
    });

    res.status(200).json({
      message: "Employee updated successfully",
      employee,
    });
  } catch (error) {
    console.error("UPDATE EMPLOYEE ERROR:", error);
    res.status(500).json({
      message: "Error updating employee",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

