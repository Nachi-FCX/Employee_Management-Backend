import { Request, Response } from "express";
import { sendMail } from "../services/mail.service";
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


export const applyLeave = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    if (!user) {
      return res.status(401).json("Unauthorized");
    }
    const employee_id = user.employee_id;
    const company_id = user.company_id;
    const { from_date, to_date, reason } = req.body;

    if (!from_date || !to_date || !reason) {
      return res.status(400).json("from_date, to_date and reason are required");
    }

    const leave = await prisma.leaveRequests.create({
      data: {
        employee_id,
        company_id,
        from_date: new Date(from_date),
        to_date: new Date(to_date),
        reason,
      },
    });

    const company = await prisma.companies.findUnique({
      where: { id: company_id },
      select: {
        company_name: true,
        contact_email: true,
      },
    });

    const employee = await prisma.employees.findUnique({
      where: { id: employee_id },
      select: {
        first_name: true,
        last_name: true,
      },
    });

   
    if (company?.contact_email) {
      await sendMail(
  company.contact_email,
  "Leave Request",
  `<div style="font-family: Arial, sans-serif; line-height: 1.6; max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 16px; padding: 28px; box-shadow: 0 8px 20px rgba(0, 0, 0, 0.08); border: 1px solid #e6ebf3;">

  <!-- Header -->
  <div style="margin-bottom: 22px; border-bottom: 2px solid #2e5bff; padding-bottom: 12px;">
    <h2 style="margin: 0; color: #1a2b4c; font-size: 20px; font-weight: 600;">
      Leave Request Notification
    </h2>
    <p style="margin: 6px 0 0 0; color: #6b7a93; font-size: 14px;">
      Leave details submitted by employee
    </p>
  </div>

  <!-- Greeting -->
  <p style="color: #1a2b4c; font-size: 15px;">
    Dear <b>Sir/Madam</b>,
  </p>

  <!-- Message -->
  <p style="color: #2d3a5e; font-size: 14.5px; margin-bottom: 18px;">
    The employee has submitted a leave request with the following details:
  </p>

  <!-- Details table -->
  <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
    <tr>
      <td style="padding: 10px; font-weight: 600; color: #1e3c72;">Company Name</td>
      <td style="padding: 10px; color: #2d3a5e;">${company.company_name}</td>
    </tr>
    <tr style="background: #f9fbff;">
      <td style="padding: 10px; font-weight: 600; color: #1e3c72;">Employee Name</td>
      <td style="padding: 10px; color: #2d3a5e;">
        ${employee?.first_name} ${employee?.last_name}
      </td>
    </tr>
    <tr>
      <td style="padding: 10px; font-weight: 600; color: #1e3c72;">Employee ID</td>
      <td style="padding: 10px; color: #2d3a5e;">${employee_id}</td>
    </tr>
    <tr style="background: #f9fbff;">
      <td style="padding: 10px; font-weight: 600; color: #1e3c72;">Leave From</td>
      <td style="padding: 10px; color: #2d3a5e;">${from_date}</td>
    </tr>
    <tr>
      <td style="padding: 10px; font-weight: 600; color: #1e3c72;">Leave To</td>
      <td style="padding: 10px; color: #2d3a5e;">${to_date}</td>
    </tr>
    <tr style="background: #f9fbff;">
      <td style="padding: 10px; font-weight: 600; color: #1e3c72;">Reason</td>
      <td style="padding: 10px; color: #2d3a5e;">${reason}</td>
    </tr>
  </table>

  <!-- Info note -->
  <p style="margin-top: 18px; font-size: 13.5px; color: #6b7a93;">
    This mail is shared for information purposes only.
  </p>

  <!-- Footer -->
  <div style="margin-top: 22px; border-top: 1px solid #e6ebf3; padding-top: 14px;">
    <p style="margin: 0; font-size: 14px; color: #1a2b4c;">
      Thank you,<br/>
      <b>Fincorpx HR Management System</b>
    </p>
    <p style="margin-top: 6px; font-size: 12px; color: #8a9bb5;">
      ${new Date().toLocaleDateString()}
    </p>
  </div>

</div>

  `
);
    }

    return res.status(201).json({
      message: "Leave applied successfully",
      data: leave,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json("Internal server error");
  }
};
