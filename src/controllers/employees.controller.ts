import { Request, Response } from "express";
import { Prisma } from "@prisma/client";
import prisma from "../prisma";

/**
 * =========================
 * CREATE EMPLOYEE
 * =========================
 */
export const createEmployee = async (req: Request, res: Response) => {
  try {
    const {
      company_id,
      role_id,
      employee_code,
      first_name,
      last_name,
      email,
      phone,
      gender,
      date_of_birth,
      join_date,
      salary,
      department_id,
      status,
    } = req.body;

    // 1. Validate required fields
    if (
      !company_id ||
      !role_id ||
      !employee_code ||
      !first_name ||
      !email ||
      !department_id
    ) {
      return res.status(400).json({
        message:
          "company_id, role_id, employee_code, first_name, email, and department_id are required",
      });
    }

    // 2. Verify department exists
    const department = await prisma.departments.findFirst({
      where: {
        department_id: Number(department_id),
      },
    });

    if (!department) {
      return res.status(404).json({
        message: "Department not found",
      });
    }

    // 3. Verify role exists
    const role = await prisma.roles.findFirst({
      where: {
        role_id: Number(role_id),
      },
    });

    if (!role) {
      return res.status(404).json({
        message: "Role not found",
      });
    }

    // 4. Create employee
    const employee = await prisma.employees.create({
      data: {
        company_id: Number(company_id),
        role_id: Number(role_id),
        employee_code: employee_code.toString().slice(0, 20),
        first_name: first_name.toString().slice(0, 100),
        last_name: last_name?.toString().slice(0, 100) || "",
        email: email.toString().slice(0, 150),
        phone: phone?.toString().slice(0, 15) || "",
        gender: gender?.toString().slice(0, 10) || "Unknown",
        date_of_birth: date_of_birth
          ? new Date(date_of_birth)
          : new Date("2000-01-01"),
        join_date: join_date ? new Date(join_date) : new Date(),
        salary: new Prisma.Decimal(salary ?? "0.00"),
        department_id: Number(department_id),
        status: status ?? true,
      },
      include: {
        role: true,
        department: true,
      },
    });

    res.status(201).json({
      message: "Employee created successfully",
      employee,
    });
  } catch (error) {
    console.error("CREATE EMPLOYEE ERROR:", error);
    res.status(500).json({
      message: "Error creating employee",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

/**
 * =========================
 * GET EMPLOYEES (BY COMPANY)
 * =========================
 */
export const getEmployees = async (req: Request, res: Response) => {
  try {
    const company_id = req.query.company_id ? Number(req.query.company_id) : null;

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

/**
 * =========================
 * UPDATE EMPLOYEE
 * =========================
 */
export const updateEmployee = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);

    if (!id) {
      return res.status(400).json({ message: "Employee ID is required" });
    }

    // Build update data (only include provided fields)
    const updateData: any = {};

    if (req.body.first_name !== undefined)
      updateData.first_name = req.body.first_name;
    if (req.body.last_name !== undefined) updateData.last_name = req.body.last_name;
    if (req.body.email !== undefined) updateData.email = req.body.email;
    if (req.body.phone !== undefined) updateData.phone = req.body.phone;
    if (req.body.gender !== undefined) updateData.gender = req.body.gender;
    if (req.body.date_of_birth !== undefined)
      updateData.date_of_birth = new Date(req.body.date_of_birth);
    if (req.body.join_date !== undefined)
      updateData.join_date = new Date(req.body.join_date);
    if (req.body.salary !== undefined)
      updateData.salary = new Prisma.Decimal(req.body.salary);
    if (req.body.department_id !== undefined)
      updateData.department_id = Number(req.body.department_id);
    if (req.body.role_id !== undefined) updateData.role_id = Number(req.body.role_id);
    if (req.body.status !== undefined) updateData.status = req.body.status;

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

/**
 * =========================
 * DELETE EMPLOYEE
 * =========================
 */
export const deleteEmployee = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);

    if (!id) {
      return res.status(400).json({ message: "Employee ID is required" });
    }

    await prisma.employees.delete({
      where: { id },
    });

    res.status(200).json({
      message: "Employee deleted successfully",
    });
  } catch (error) {
    console.error("DELETE EMPLOYEE ERROR:", error);
    res.status(500).json({
      message: "Error deleting employee",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};
