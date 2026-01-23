import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

interface RootJwtPayload {
  root_user_id: number;
  type: "ROOT";
  iat: number;
  exp: number;
}

export const rootAuthMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;

    // 1️⃣ Check header
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        message: "Authorization token missing",
      });
    }

    // 2️⃣ Extract token
    const token = authHeader.split(" ")[1];

    // 3️⃣ Verify token
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || "secret_key"
    ) as RootJwtPayload;

    // 4️⃣ Ensure ROOT access
    if (decoded.type !== "ROOT") {
      return res.status(403).json({
        message: "Root access required",
      });
    }

    // 5️⃣ Attach root user info to request
    (req as any).rootUser = {
      root_user_id: decoded.root_user_id,
    };

    next();
  } catch (error) {
    return res.status(401).json({
      message: "Invalid or expired token",
    });
  }
};
