import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

const COOKIE_NAME = "jid";

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const token =
    req.cookies?.[COOKIE_NAME] || null;

  if (!token) return res.status(401).json({ message: "Missing token" });

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET as string);
    (req as any).user = payload;
    next();
  } catch (e: any) {
    return res.status(401).json({ message: e?.name === "TokenExpiredError" ? "Token expired" : "Invalid token" });
  }
}
