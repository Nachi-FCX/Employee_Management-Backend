import { Request, Response } from "express";
import prisma from "../prisma";


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

export const Logs = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const employee_id = user.employee_id;
    const company_id = user.company_id;

    const { from_date, to_date } = req.query;

    const where: any = {
      employee_id,
      company_id,
    };

    if (from_date && to_date) {
      where.date = {
        gte: new Date(from_date as string),
        lte: new Date(to_date as string),
      };
    }

    const logs = await prisma.attendance.findMany({
      where,
      orderBy: { date: "desc" },
    });

    return res.status(200).json({
      message: "Attendance logs fetched",
      data: logs,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json("Internal server error");
  }
};


export const fullLogs = async (req: Request, res: Response) => {
  try {
    const rootUser = (req as any).rootUser;

    const {
      company_id,
      employee_id,
      from_date,
      to_date,
    } = req.query;

    const companies = await prisma.companies.findMany({
      where: { root_user_id: rootUser.id },
      select: { id: true },
    });

    const allowedCompanyIds = companies.map(c => c.id);

    if (company_id && !allowedCompanyIds.includes(Number(company_id))) {
      return res.status(403).json("Unauthorized company access");
    }

    const where: any = {
      company_id: company_id
        ? Number(company_id)
        : { in: allowedCompanyIds },
    };

    if (employee_id) {
      where.employee_id = Number(employee_id);
    }

    if (from_date && to_date) {
      where.date = {
        gte: new Date(from_date as string),
        lte: new Date(to_date as string),
      };
    }

    const logs = await prisma.attendance.findMany({
      where,
      include: {
        employee: {
          select: {
            id: true,
            first_name: true,
            last_name: true,
            employee_code: true,
          },
        },
        company: {
          select: {
            id: true,
            company_name: true,
            company_code: true,
          },
        },
      },
      orderBy: { date: "desc" },
    });

    return res.status(200).json({
      message: "Attendance logs fetched",
      count: logs.length,
      data: logs,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json("Internal server error");
  }
};
