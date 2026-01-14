import { Request, Response } from "express";
import prisma from "../prisma";

/**
 * CREATE EMPLOYEE
 */
export const createEmployee = async (req: Request, res: Response) => {
  try {
    const employee = await prisma.employees.create({
      data: {
        employee_code: req.body.employee_code,
        first_name: req.body.first_name,
        last_name: req.body.last_name,
        email: req.body.email,
        phone: req.body.phone,
        gender: req.body.gender,
        date_of_birth: new Date(req.body.date_of_birth),
        join_date: new Date(req.body.join_date),
        salary: Number(req.body.salary),
        status: req.body.status,
        department_id: Number(req.body.department_id),
        role_id: Number(req.body.role_id),
      },
    });

    res.status(201).json(employee);
  } catch (error) {
    console.error("CREATE EMPLOYEE ERROR:", error);
    res.status(400).json({
      message: "Error creating employee",
      error,
    });
  }
};

/**
 * GET ALL EMPLOYEES
 */
export const getEmployees = async (_req: Request, res: Response) => {
  try {
    const employees = await prisma.employees.findMany({
      include: {
        department: true,
        role: true,
      },
    });

    res.status(200).json(employees);
  } catch (error) {
    console.error("GET EMPLOYEES ERROR:", error);
    res.status(500).json({
      message: "Error fetching employees",
      error,
    });
  }
};

/**
 * UPDATE EMPLOYEE
 */
export const updateEmployee = async (req: Request, res: Response) => {
  try {
    const employee_id = Number(req.params.id);

    const employee = await prisma.employees.update({
      where: { employee_id },
      data: {
        ...req.body,
      },
    });

    res.status(200).json(employee);
  } catch (error) {
    console.error("UPDATE EMPLOYEE ERROR:", error);
    res.status(400).json({
      message: "Error updating employee",
      error,
    });
  }
};

/**
 * DELETE EMPLOYEE
 */
export const deleteEmployee = async (req: Request, res: Response) => {
  try {
    const employee_id = Number(req.params.id);

    await prisma.employees.delete({
      where: { employee_id },
    });

    res.status(200).json({
      message: "Employee deleted successfully",
    });
  } catch (error) {
    console.error("DELETE EMPLOYEE ERROR:", error);
    res.status(400).json({
      message: "Error deleting employee",
      error,
    });
  }
};
