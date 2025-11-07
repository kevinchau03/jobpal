import { Router } from "express";
import { PrismaClient } from "../../generated/prisma/client";
import bcrypt from "bcryptjs";
import { requireAuth } from "../auth";
import jwt from "jsonwebtoken";

const prisma = new PrismaClient();
export const userRouter = Router();

const COOKIE_NAME = "jid";

userRouter.post("/signup", async (req, res) => {
  try {
    const { email, password, name } = req.body as {
      email: string;
      password: string;
      name: string;
    };
    if (!email || !password || !name)
      return res.status(400).json({ message: "Missing fields" });

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser)
      return res.status(409).json({ message: "Email already in use" });

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: { email, password: hashedPassword, name },
    });

    const token = jwt.sign(
      { sub: user.id, email: user.email, role: user.role ?? "USER" },
      process.env.JWT_SECRET as string,
      { expiresIn: "7d" }
    );

    return res.status(201).json({ token, user });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Signup failed" });
  }
});

userRouter.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body as { email: string; password: string };
    if (!email || !password) return res.status(400).json({ message: "Missing credentials" });

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(401).json({ message: "Invalid email or password" });

    const ok = await bcrypt.compare(password, user.password);
    if (!ok) return res.status(401).json({ message: "Invalid email or password" });

    const token = jwt.sign(
      { sub: user.id, email: user.email, role: user.role ?? "USER" },
      process.env.JWT_SECRET as string,
      { expiresIn: "7d" }
    );

    res.cookie(COOKIE_NAME, token, {
      httpOnly: true,
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      secure: process.env.NODE_ENV === "production", // true on HTTPS in prod
      path: "/", // send to all routes
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7d
    });


    return res.json({
      token,
      user: { id: user.id, email: user.email, name: user.name, role: user.role },
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Login failed" });
  }
});

userRouter.post("/logout", (_req, res) => {
  res.clearCookie(COOKIE_NAME, {
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
  });
  res.json({ ok: true });
});

userRouter.get("/me", requireAuth, async (req, res) => {
  const { sub: userId } = (req as any).user as { sub: string };
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, email: true, name: true, role: true, createdAt: true },
  });
  if (!user) return res.status(404).json({ message: "User not found" });
  res.json(user);
});

userRouter.get("/", async (req: any, res) => {
  const users = await prisma.user.findMany();
  res.json(users);
});