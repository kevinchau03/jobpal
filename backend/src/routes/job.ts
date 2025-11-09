import { Router } from "express";
import { PrismaClient } from "../../generated/prisma/client";
import { requireAuth } from "../auth";

const prisma = new PrismaClient();
export const jobRouter = Router();

jobRouter.get("/", requireAuth, async (req, res) => {
  const { sub: userId } = (req as any).user as { sub: string };
  const take = Math.min(Number(req.query.limit) || 20, 100);
  const cursor = req.query.cursor as string | undefined;
  const status = req.query.status as string | undefined;

  const where = { userId, ...(status ? { status } : {}) };

  const jobs = await prisma.job.findMany({
    orderBy: { createdAt: "desc" },
    take: take + 1,
    ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
    select: { 
      id: true, 
      title: true, 
      company: true, 
      status: true, 
      location: true,
      jobType: true,
      createdAt: true 
    },
  });

  const nextCursor = jobs.length > take ? jobs[take].id : null;
  if (nextCursor) jobs.pop();

  res.json({ items: jobs, nextCursor });
});

jobRouter.get("/summary", requireAuth, async (req, res) => {
  const { sub: userId } = (req as any).user as { sub: string };

  // Option A: groupBy (one call)
  const grouped = await prisma.job.groupBy({
    by: ["status"],
    where: { userId },
    _count: { _all: true },
  });

  const toCount = (s: string) => grouped.find(g => g.status === s)?._count._all || 0;

  res.json({
    total: grouped.reduce((a, g) => a + g._count._all, 0),
    SAVED: toCount("SAVED"),
    APPLIED: toCount("APPLIED"),
    SCREEN: toCount("SCREEN"),
    INTERVIEWING: toCount("INTERVIEWING"),
    OFFER: toCount("OFFER"),
    WITHDRAWN: toCount("WITHDRAWN"),
    GHOSTED: toCount("GHOSTED"),
    REJECTED: toCount("REJECTED"),
  });
});



jobRouter.post("/", requireAuth, async (req, res) => {
  try {
    const { sub: userId } = (req as any).user as { sub: string };
    const { title, company, status, location, jobType } = req.body as {
      title: string;
      company?: string;
      status?: "SAVED" | "APPLIED" | "SCREEN" | "INTERVIEWING" | "OFFER" | "WITHDRAWN" | "GHOSTED" | "REJECTED";
      location?: string;
      jobType?: "PART_TIME" | "FULL_TIME" | "INTERNSHIP" | "CONTRACT";
    };

    if (!title) return res.status(400).json({ message: "Title is required" });

    const job = await prisma.job.create({
      data: {
        title,
        company: company ?? null,
        status: status ?? "SAVED",
        location: location ?? null,
        jobType: jobType ?? null,
        userId,
      },
      select: { 
        id: true, 
        title: true, 
        company: true, 
        status: true, 
        location: true,
        jobType: true,
        createdAt: true 
      },
    });

    res.status(201).json(job);
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "Could not create job" });
  }
});

jobRouter.delete("/:id", requireAuth, async (req, res) => {
  try {
    const { sub: userId } = (req as any).user as { sub: string };
    const jobId = req.params.id;

    const job = await prisma.job.findUnique({ where: { id: jobId } });
    if (!job || job.userId !== userId) {
      return res.status(404).json({ message: "Job not found" });
    }

    await prisma.job.delete({ where: { id: jobId } });
    res.status(204).end();
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "Could not delete job" });
  }
});

jobRouter.put("/:id", requireAuth, async (req, res) => {
  try {
    const { sub: userId } = (req as any).user as { sub: string };
    const jobId = req.params.id;
    const { title, company, status, location, jobType } = req.body as {
      title?: string;
      company?: string;
      status?: "SAVED" | "APPLIED" | "SCREEN" | "INTERVIEWING" | "OFFER" | "WITHDRAWN" | "GHOSTED" | "REJECTED";
      location?: string;
      jobType?: "PART_TIME" | "FULL_TIME" | "INTERNSHIP" | "CONTRACT";
    };

    const job = await prisma.job.findUnique({ where: { id: jobId } });
    if (!job || job.userId !== userId) {
      return res.status(404).json({ message: "Job not found" });
    }

    const updatedJob = await prisma.job.update({
      where: { id: jobId },
      data: {
        ...(title !== undefined ? { title } : {}),
        ...(company !== undefined ? { company } : {}),
        ...(status !== undefined ? { status } : {}),
        ...(location !== undefined ? { location } : {}),
        ...(jobType !== undefined ? { jobType } : {}),
      },
      select: {
        id: true,
        title: true,
        company: true,
        status: true,
        location: true,
        jobType: true,
        createdAt: true
      },
    });

    res.json(updatedJob);
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "Could not update job" });
  }
});
