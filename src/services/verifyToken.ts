import jwt from "jsonwebtoken";

export const verifyToken = (authHeader?: string) => {
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    throw new Error("TOKEN_MISSING");
  }

  const parts = authHeader.trim().split(/\s+/);
  const token = parts[1];

  if (!token) {
    throw new Error("MALFORMED_TOKEN");
  }

  return jwt.verify(token, process.env.JWT_SECRET!) as any;
};
