import { Router } from "express";
import { PrismaClient } from "../../generated/prisma/client";
import bcrypt from "bcryptjs";
import { requireAuth } from "../auth";
import jwt from "jsonwebtoken";
import { sendVerificationEmail } from "../services/email";
import { generateVerificationCode, getCodeExpiration } from "../utils/verification";

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
    const verificationCode = generateVerificationCode();
    const verificationCodeExpires = getCodeExpiration();

    const user = await prisma.user.create({
      data: { 
        email, 
        password: hashedPassword, 
        name,
        verificationCode,
        verificationCodeExpires,
        emailVerified: false
      },
    });

    const emailSent = await sendVerificationEmail(email, verificationCode, name);
    if (!emailSent) {
      console.log("Failed to send verification email to", email);
      return res.status(500).json({ message: "Failed to send verification email" });
    }

    return res.status(201).json({ 
      message: "Account created. Please check your email for verification code.",
      userId: user.id 
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Signup failed" });
  }
});

userRouter.post("/verify-email", async (req, res) => {
  try {
    const { email, code } = req.body as { email: string; code: string };
    if (!email || !code) {
      return res.status(400).json({ message: "Email and code are required" });
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.emailVerified) {
      return res.status(400).json({ message: "Email already verified" });
    }

    if (!user.verificationCode || !user.verificationCodeExpires) {
      return res.status(400).json({ message: "No verification code found" });
    }

    if (new Date() > user.verificationCodeExpires) {
      return res.status(400).json({ message: "Verification code expired" });
    }

    if (user.verificationCode !== code) {
      return res.status(400).json({ message: "Invalid verification code" });
    }

    await prisma.user.update({
      where: { id: user.id },
      data: {
        emailVerified: true,
        verificationCode: null,
        verificationCodeExpires: null,
      },
    });

    const token = jwt.sign(
      { sub: user.id, email: user.email, role: user.role ?? "USER" },
      process.env.JWT_SECRET as string,
      { expiresIn: "7d" }
    );

    res.cookie(COOKIE_NAME, token, {
      httpOnly: true,
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.json({
      token,
      user: { id: user.id, email: user.email, name: user.name, role: user.role },
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Verification failed" });
  }
});

userRouter.post("/resend-verification", async (req, res) => {
  try {
    const { email } = req.body as { email: string };
    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.emailVerified) {
      return res.status(400).json({ message: "Email already verified" });
    }

    const verificationCode = generateVerificationCode();
    const verificationCodeExpires = getCodeExpiration();

    await prisma.user.update({
      where: { id: user.id },
      data: {
        verificationCode,
        verificationCodeExpires,
      },
    });

    const emailSent = await sendVerificationEmail(email, verificationCode, user.name);
    if (!emailSent) {
      return res.status(500).json({ message: "Failed to send verification email" });
    }

    return res.json({ message: "Verification code sent" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Failed to resend verification" });
  }
});

userRouter.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body as { email: string; password: string };
    if (!email || !password) return res.status(400).json({ message: "Missing credentials" });

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(401).json({ message: "Invalid email or password" });

    if (!user.emailVerified) {
      return res.status(401).json({ message: "Please verify your email before logging in" });
    }

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
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    console.log(`User ${user.email} logged in`);

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
  try {
    const { sub: userId } = (req as any).user as { sub: string };
    console.log('GET /me - authenticated user ID:', userId);
    
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true, name: true, role: true, createdAt: true, exp: true },
    });
    
    if (!user) {
      console.log('GET /me - user not found in database:', userId);
      return res.status(404).json({ message: "User not found" });
    }
    
    console.log('GET /me - returning user:', user.email);
    res.json(user);
  } catch (error) {
    console.error('GET /me - error:', error);
    res.status(500).json({ message: "Internal server error" });
  }
});

userRouter.get("/", async (req: any, res) => {
  const users = await prisma.user.findMany();
  res.json(users);
});

