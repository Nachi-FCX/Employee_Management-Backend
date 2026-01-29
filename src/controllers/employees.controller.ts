import { Request, Response } from "express";
import { Prisma } from "@prisma/client";
import prisma from "../prisma";
import { Decimal } from "@prisma/client/runtime/library";
import { error } from "node:console";
import bcrypt from "bcrypt";

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
        salary: new Decimal(salary ?? "0.00"),
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
      updateData.salary = new Number(req.body.salary);
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



export const changepassword = async(req:Request,res:Response)=>{
  try{
    const{oldpassword,newpassword,id} = req.body;

    if(!oldpassword || !newpassword)
      throw error(400,"all fields are required");

    if(oldpassword == newpassword)
      throw error(401,"old and new password are same");
    
    const users = await prisma.users.findUnique({where:
      { id },

    })

    if (!users) throw error(404,"User does not exit")


    const isValid = await bcrypt.compare(oldpassword, users.password_hash)
     

    if(!isValid)
     throw error(401,"old password is Invalid");
  
    const hashedPassword = await bcrypt.hash(newpassword, 10)

    


    await prisma.users.update({
      where: {id},
      data:{
        password_hash : hashedPassword
      }
    });

    return res.status(200).json("password changed successfully");


  }
  catch(error){
    console.log(error);
    return res.status(500).json("Internal server error ");

  
  }
}



export const checkedIn = async( req : Request,res: Response) => {    
    const{employee_id} = req.body;

  const employee = await prisma.employees.findUnique({
  where: { id: employee_id }});

  if (!employee) {
  return res.status(404).json("Employee not found");
  }


  const current_Date = new Date().toISOString().split('T')[0]; 
  const current_Time = new Date().toLocaleTimeString('en-US', {

    hour12: false,
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });


  const existing = await prisma.attendance.findFirst({
    where: {
      employee_id,
      date: {
        gte: new Date(`${current_Date}T00:00:00`),
        lt: new Date(`${current_Date}T23:59:59.999`)
      },
      check_out: null
    }
  });

  if (existing) {
    return res.status(409).json("The employee has already checked in");
  }



  const attendance = await prisma.attendance.create({
    data: {
      employee_id,
      date: new Date(current_Date),
      check_in: new Date(`${current_Date}T${current_Time}`),
      status: "IN"
    }
  });

  return res.status(200).json(attendance);
};


export const checkedOut = async (req: Request, res: Response) => {
  const { employee_id } = req.body;

  const employee = await prisma.employees.findUnique({
  where: { id: employee_id }
});

if (!employee) {
  return res.status(404).json("Employee not found");
}


  const current_Date = new Date().toISOString().split('T')[0];
  const current_Time = new Date().toLocaleTimeString('en-US', {
    hour12: false,
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });


  const attendance = await prisma.attendance.findFirst({
    where: {
      employee_id,
      date: {
        gte: new Date(`${current_Date}T00:00:00`),
        lt: new Date(`${current_Date}T23:59:59.999`)
      },
      check_out: null
    }
  });

  if (!attendance || !attendance.check_in) {
    return res.status(409).json("The employee has not checked in");
  }

  const checkOutTime = new Date(`${current_Date}T${current_Time}`);


  const totalHours = checkOutTime.getTime() - attendance.check_in.getTime();
  const workedHours = +(totalHours / (1000 * 60 * 60)).toFixed(2);

  const updated = await prisma.attendance.update({
    where: { attendance_id: attendance.attendance_id },
    data: {
      check_out: checkOutTime,
      status: "OUT"
    }
  });

  return res.status(200).json({...updated, work_hours: workedHours});
};


