import { Request, Response } from "express";
import bcrypt from "bcrypt";
import prisma from "../prisma";
import { error } from "node:console";





export const changepassword = async(req:Request,res:Response)=>{
  try{
    const{oldpassword,newpassword,id} = req.body;

    if(!oldpassword || !newpassword)
      throw error(400,"all fields are required");

    if(oldpassword == newpassword)
      throw error(401,"old and new password are same");
    
    const users = await prisma.rootUser.findUnique({where:
      { id },

    })

    if (!users) throw error(404,"User does not exit")


    const isValid = await bcrypt.compare(oldpassword, users.password_hash)
     

    if(!isValid)
     throw error(401,"old password is Invalid");
  
    const hashedPassword = await bcrypt.hash(newpassword, 10)

    


    await prisma.rootUser.update({
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

export const getCompanies = async(req:Request,res: Response) =>{
    const rootUser = (req as any).rootUser;



    if(!rootUser){
      return res.status(403).json({message:"access denied"});
    }

    


    const companies = await prisma.companies.findMany({
      select:{
        id:true,
        company_name: true

      },
      where:{
        root_user_id:rootUser.root_user_id
        
      }
    });
  console.log(rootUser)
  res.json(companies);
}
