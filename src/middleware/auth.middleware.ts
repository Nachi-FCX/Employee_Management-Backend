        
        
                          
                          
                                        /////////////////////   Not In Use   ////////////////////////
                                        //////////////////// Alternative Middleware ////////////////////
                                        ///////////////////  Root and User Validation //////////////////


import { Request, Response, NextFunction } from "express";      
import jwt from "jsonwebtoken";

export const unifiedAuth = (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Authorization token missing" });
    }

    const parts = authHeader.trim().split(/\s+/);
    const token = parts[1];

    if (!token) {
      return res.status(401).json({ message: "Malformed token" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;

    if (decoded.type === "ROOT") {
      (req as any).rootUser = {
        root_user_id: decoded.root_user_id,
      };
      return next();
    }

    (req as any).user = {
      id: decoded.user_id,
      employee_id: decoded.employee_id,   
      company_id: decoded.company_id,
      role: decoded.role,
    };

    next();
  } catch (error) {
    console.error("JWT Error:", (error as any).name);
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};


