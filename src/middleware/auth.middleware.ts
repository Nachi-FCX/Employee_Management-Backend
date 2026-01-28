import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

export const unifiedAuth = (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Authorization token missing" });
    }

    // Use regex to split by one or more spaces and filter out empty results
    const parts = authHeader.trim().split(/\s+/);
    const token = parts[1]; 

    if (!token) {
      return res.status(401).json({ message: "Malformed token" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;

    if (decoded.type === "ROOT") {
      (req as any).rootUser = { root_user_id: decoded.root_user_id };
      return next();
    }

    (req as any).user = {
      id: decoded.user_id, // Note: Use user_id to match your Login payload
      company_id: decoded.company_id,
      role: decoded.role,
    };

    next();
  } catch (error) {
    console.error("JWT Error:", (error as any).name);
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};


export const rootAuth = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;

    // 1. Check if Authorization header exists and follows Bearer schema
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Authorization token missing" });
    }

    // 2. Extract token using regex to handle multiple spaces (common in Postman logs)
    const parts = authHeader.trim().split(/\s+/);
    const token = parts[1];

    if (!token) {
      return res.status(401).json({ message: "Malformed token" });
    }

    // 3. Verify the JWT
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET!
    ) as any;

    // 4. Attach data to request based on user type
    if (decoded.type === "ROOT") {
      (req as any).rootUser = {
        root_user_id: decoded.root_user_id,
      };
      return next(); // Proceed for Root users
    }

    // 5. Attach data for Company Employees
    (req as any).user = {
      id: decoded.user_id, // Matches 'user_id' from your unifiedLogin payload
      company_id: decoded.company_id,
      role: decoded.role,
    };

    next();
  } catch (error) {
    // Log the specific JWT error (TokenExpiredError or JsonWebTokenError)
    console.error("JWT Error:", (error as any).name);
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};