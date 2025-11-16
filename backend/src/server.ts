import "dotenv/config";
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";


import { userRouter } from "./routes/user";
import { jobRouter } from "./routes/job";
import { contactRouter } from "./routes/contact";
import { reminderRouter } from "./routes/reminder";

const app = express();

app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  })
);

// Routers
app.use("/api/users", userRouter);
app.use("/api/jobs", jobRouter);
app.use("/api/contacts", contactRouter);
app.use("/api/reminders", reminderRouter);

// Health check
app.get("/api/health", (_req, res) => res.json({ ok: true }));

const port = process.env.PORT || 4000;
app.listen(port, () => console.log(`BOOM! WE ARE running on port ${port}`));
