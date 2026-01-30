import { Request, Response, NextFunction } from "express";
import { verifyToken } from "../services/verifyToken";

export const RootValidation = (req: Request, res: Response, next: NextFunction) => {
  try {
    const decoded = verifyToken(req.headers.authorization);

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
  } catch (error: any) {
    return res.status(401).json({ message: error.message });
  }
};
