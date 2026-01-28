import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

export const companyAuthMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Authorization token missing" });
    }

    const token = authHeader.split(" ")[1];

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || "secret_key"
    ) as any;

    // Must NOT be root
    if (decoded.type === "ROOT") {
      return res.status(403).json({
        message: "Root cannot access this resource",
      });
    }

    // Attach company user
    (req as any).user = {
      id: decoded.id,
      company_id: decoded.company_id,
      role: decoded.role,
    };

    next();
  } catch (error) {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};
