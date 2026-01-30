import { Request, Response, NextFunction } from "express";
import { verifyToken } from "../services/verifyToken";

export const TokenValidation = (req: Request, res: Response, next: NextFunction) => {
  try {
    const decoded = verifyToken(req.headers.authorization);

    // (req as any).auth = decoded;

    next();
  } catch (error: any) {
    return res.status(401).json({ message: error.message });
  }
};
