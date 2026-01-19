import { Response } from "express";
import pool from "../config/db";
import { AuthRequest } from "../middleware/authMiddleware";

const OFFICE_START = "10:15"; // late login after this
const FULL_DAY_HOURS = 8;
const HALF_DAY_HOURS = 4;

const calculateHours = (inTime: string, outTime: string) => {
  const start = new Date(`1970-01-01T${inTime}`);
  const end = new Date(`1970-01-01T${outTime}`);
  return (end.getTime() - start.getTime()) / 3600000;
};

export const checkIn = async (req: AuthRequest, res: Response) => {
  const employeeId = req.user!.employeeId;
  const today = new Date().toISOString().split("T")[0];

  try {
    await pool.query(
      `
      INSERT INTO "Employee_management".attendance
      (employee_id, date, check_in)
      VALUES ($1, $2, CURRENT_TIME)
      `,
      [employeeId, today]
    );

    res.status(201).json({ message: "Check-in successful" });
  } catch (err: any) {
    if (err.code === "23505") {
      return res.status(400).json({ message: "Already checked in today" });
    }
    res.status(500).json({ message: "Server error" });
  }
};

export const checkOut = async (req: AuthRequest, res: Response) => {
  const employeeId = req.user!.employeeId;
  const today = new Date().toISOString().split("T")[0];

  const result = await pool.query(
    `
    UPDATE "Employee_management".attendance
    SET check_out = CURRENT_TIME
    WHERE employee_id = $1 AND date = $2
    RETURNING check_in, check_out
    `,
    [employeeId, today]
  );

  if (result.rowCount === 0) {
    return res.status(400).json({ message: "Check-in not found" });
  }

  const { check_in, check_out } = result.rows[0];
  const hours = calculateHours(check_in, check_out);

  let attendanceType = "ABSENT";

  if (hours >= FULL_DAY_HOURS) attendanceType = "FULL_DAY";
  else if (hours >= HALF_DAY_HOURS) attendanceType = "HALF_DAY";

  if (check_in > OFFICE_START) attendanceType = "LATE_LOGIN";
  if (hours > 9) attendanceType = "OT";

  await pool.query(
    `
    UPDATE "Employee_management".attendance
    SET attendance_type = $1, work_hours = $2
    WHERE employee_id = $3 AND date = $4
    `,
    [attendanceType, hours, employeeId, today]
  );

  res.json({ message: "Check-out successful", attendanceType, hours });
};

export const myAttendance = async (req: AuthRequest, res: Response) => {
  const employeeId = req.user!.employeeId;

  const result = await pool.query(
    `
    SELECT date, check_in, check_out, work_hours, attendance_type
    FROM "Employee_management".attendance
    WHERE employee_id = $1
    ORDER BY date DESC
    `,
    [employeeId]
  );

  res.json(result.rows);
};
