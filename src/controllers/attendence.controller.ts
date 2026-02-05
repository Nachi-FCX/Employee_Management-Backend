import { Request, Response } from "express";
import { Prisma } from "@prisma/client";
import prisma from "../prisma";
import { Decimal } from "@prisma/client/runtime/library";
import { error } from "node:console";
import bcrypt from "bcrypt";


export const attendance = async (req: Request, res: Response) => {
  try {
    const { employee_id, company_id } = req.body;

    if (!employee_id || !company_id) {
      return res.status(400).json("employee_id and company_id are required");
    }


    const employee = await prisma.employees.findFirst({
      where: {
        id: employee_id,
        company_id
      }
    });

    if (!employee) {
      return res.status(404).json("Employee not found for this company");
    }

    const now = new Date();
    const currentDate = now.toISOString().split("T")[0];

    const startOfDay = new Date(`${currentDate}T00:00:00`);
    const endOfDay = new Date(`${currentDate}T23:59:59.999`);


    const attendance = await prisma.attendance.findFirst({
      where: {
        employee_id,
        company_id,
        date: {
          gte: startOfDay,
          lt: endOfDay
        }
      }
    });

   
    if (!attendance) {
      const checkIn = await prisma.attendance.create({
        data: {
          employee_id,
          company_id,
          date: startOfDay,
          check_in: now,
          status: "IN"
        }
      });

      return res.status(200).json({
        message: "Checked in successfully",
        data: checkIn
      });
    }

   
    if (!attendance.check_out) {
      const workedMilliseconds = now.getTime() - attendance.check_in!.getTime();
      const workedHours = Math.round((workedMilliseconds / 3600000) * 100) / 100;

      const updated = await prisma.attendance.update({
        where: { attendance_id: attendance.attendance_id },
        data: {
          check_out: now,
          status: "OUT"
        }
      });

      return res.status(200).json({
        message: "Checked out successfully",
        data: { ...updated, work_hours: workedHours }
      });
    }

    
    return res.status(409).json("Employee has already checked out today");

  } catch (error) {
    console.error(error);
    return res.status(500).json("Internal server error");
  }
};
