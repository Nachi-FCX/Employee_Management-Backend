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

                                                                                                               
    if (!authHeader || !authHeader.startsWith("Bearer ")) {                                                        // Check header        
      return res.status(401).json({
        message: "Authorization token missing",
      });
    }
                                                                                       
    const token = authHeader.split(" ")[1];                                                          // Extract token                                 
    
    const decoded = jwt.verify(                                                                      // Verify token
      token,
      process.env.JWT_SECRET || "secret_key"
    ) as RootJwtPayload;

    
    if (decoded.type !== "ROOT") {                                                                 // Check if root user 
      return res.status(403).json({
        message: "Root access required",
      });
    }

    (req as any).rootUser = {                                                               //  Attach root user info to request
      root_user_id: decoded.root_user_id,
    };

    next();
  } catch (error) {
    return res.status(401).json({
      message: "Invalid or expired token",
    });
  }
};
