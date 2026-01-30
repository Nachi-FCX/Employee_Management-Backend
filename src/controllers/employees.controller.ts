import { Request, Response } from "express";
import { Prisma } from "@prisma/client";
import prisma from "../prisma";
import { Decimal } from "@prisma/client/runtime/library";
import { error } from "node:console";
import bcrypt from "bcrypt";

export const createEmployee = async (req: Request, res: Response) => {                            // create employee    
  try {
    const rootUser = (req as any).rootUser;
    const user = (req as any).user;

    let company_id: number;
    let create_by: number | null;

    if (rootUser?.id || rootUser?.root_user_id) {                                              // ROOT USER FLOW                 
      const rootUserId = rootUser.id ?? rootUser.root_user_id;

      if (!req.body.company_id) {
        return res.status(400).json({
          message: "company_id is required for root user",
        });
      }

      const requestedCompanyId = Number(req.body.company_id);

      const company = await prisma.companies.findFirst({                            //  validate company belongs to root
        where: {
          id: requestedCompanyId,
          root_user_id: rootUserId,
        },
      });

      if (!company) {
        return res.status(403).json({
          message: "You are not authorized to access this company",
        });
      }

      company_id = company.id;
      create_by = null;                                                           //  if root created (create = NULL)
    }

    else if (user?.company_id && user?.employee_id) {                                               // EMPLOYEE USER FLOW
      company_id = user.company_id;
      create_by = user.employee_id;                                                               // created by EMPLOYEE id
    }

    else {
      return res.status(403).json({
        message: "Unauthorized to create employee",
      });
    }

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

    const count = await prisma.employees.count({
      where: { company_id },
    });

    const employee_code =
      company.company_code + String(count + 1).padStart(4, "0");

    const password_hash = await bcrypt.hash(password, 10);


    const result = await prisma.$transaction(async (tx) => {
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
          create_by, 
        },
      });

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

export const getEmployees = async (req: Request, res: Response) => {                                     // get employees          
  try {
    const user = (req as any).user;
    const rootUser = (req as any).rootUser;

    let company_id: number;

    if (rootUser?.id || rootUser?.root_user_id) {                                   // ROOT USER FLOW
      const rootUserId = rootUser.id ?? rootUser.root_user_id;

      if (!req.body.company_id) {
        return res.status(400).json({
          message: "company_id is required for root user",
        });
      }

      const requestedCompanyId = Number(req.body.company_id);

      const company = await prisma.companies.findFirst({                              //  validate company belongs to root
        where: {
          id: requestedCompanyId,
          root_user_id: rootUserId,
        },
      });

      if (!company) {
        return res.status(403).json({
          message: "You are not authorized to access this company",
        });
      }

      company_id = company.id;
    }


    else if (user?.company_id) {                                                                        // EMPLOYEE USER FLOW
      company_id = user.company_id;
    }

    else {
      return res.status(401).json({ message: "Unauthorized" });
    }


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

    return res.status(200).json({
      total: employees.length,
      employees,
    });
  } catch (error) {
    console.error("GET EMPLOYEES ERROR:", error);
    return res.status(500).json({
      message: "Error fetching employees",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};



export const updateEmployee = async (req: Request, res: Response) => {                                   // update employee
  try {
    const id = Number(req.params.id);
    const user = (req as any).user;
    const rootUser = (req as any).rootUser;

    if (!id) {
      return res.status(400).json({ message: "Employee ID is required" });
    }

    const existingEmployee = await prisma.employees.findUnique({
      where: { id },
    });

    if (!existingEmployee) {
      return res.status(404).json({ message: "Employee not found" });
    }

    if (rootUser?.id || rootUser?.root_user_id) {                                     // FOR ROOTUSER
      const rootUserId = rootUser.id ?? rootUser.root_user_id;

      if (!req.body.company_id) {
        return res.status(400).json({
          message: "company_id is required for root user",
        });
      }

      const companyIdFromBody = Number(req.body.company_id);

      
      if (existingEmployee.company_id !== companyIdFromBody) {                    // employee must belong to the given company
        return res.status(403).json({
          message: "Employee does not found in given company",
        });
      }

  
      const company = await prisma.companies.findFirst({                          // company must belong to root
        where: {
          id: companyIdFromBody,
          root_user_id: rootUserId,
        },
      });

      if (!company) {
        return res.status(403).json({
          message: "You are not authorized to update this employee",
        });
      }
    }


    else if (user?.company_id) {                                                    // FOR EMPLOYEE USER
      if (user.company_id !== existingEmployee.company_id) {
        return res.status(403).json({
          message: "You cannot update employees from another company",
        });
      }

      if (req.body.status === false) {
        return res.status(403).json({
          message: "Employees are not allowed to deactivate employees",
        });
      }
    }

    else {
      return res.status(401).json({ message: "Unauthorized" });
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
      updateData.salary = new Number(req.body.salary);
    if (req.body.department_id !== undefined)
      updateData.department_id = Number(req.body.department_id);
    if (req.body.role_id !== undefined)
      updateData.role_id = Number(req.body.role_id);
    if (req.body.status !== undefined)
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

    return res.status(200).json({
      message: "Employee updated successfully",
      employee,
    });
  } catch (error) {
    console.error("UPDATE EMPLOYEE ERROR:", error);
    return res.status(500).json({
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


