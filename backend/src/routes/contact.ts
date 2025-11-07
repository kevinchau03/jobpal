import { Router } from "express";
import { PrismaClient } from "../../generated/prisma/client";
import { requireAuth } from "../auth";

const prisma = new PrismaClient();
export const contactRouter = Router();

contactRouter.get("/", requireAuth, async (req, res) => {
  const { sub: userId } = (req as any).user as { sub: string };
  const take = Math.min(Number(req.query.limit) || 20, 100);
  const cursor = req.query.cursor as string | undefined;
  const status = req.query.status as string | undefined;

  const where = { userId, ...(status ? { status } : {}) };

  const contacts = await prisma.contact.findMany({
    where,
    orderBy: { createdAt: "desc" },
    take: take + 1,
    ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
    select: { id: true, name: true, company: true, status: true, createdAt: true },
  });

  const nextCursor = contacts.length > take ? contacts[take].id : null;
  if (nextCursor) contacts.pop();

  res.json({ items: contacts, nextCursor });
});

contactRouter.get("/summary", requireAuth, async (req, res) => {
  const { sub: userId } = (req as any).user as { sub: string };

  // Option A: groupBy (one call)
  const grouped = await prisma.contact.groupBy({
    by: ["status"],
    where: { userId },
    _count: { _all: true },
  });

  const toCount = (s: string) => grouped.find(g => g.status === s)?._count._all || 0;

  res.json({
    total: grouped.reduce((a, g) => a + g._count._all, 0),
    REACHED_OUT: toCount("REACHED_OUT"),
    IN_CONTACT: toCount("IN_CONTACT"),
    NOT_INTERESTED: toCount("NOT_INTERESTED"),
    INTERESTED: toCount("INTERESTED"),
    FOLLOW_UP: toCount("FOLLOW_UP"),
  });
});



contactRouter.post("/", requireAuth, async (req, res) => {
  try {
    const { sub: userId } = (req as any).user as { sub: string };
    const { name, company, status } = req.body as {
      name: string;
      company?: string;
      status?: "SAVED" | "APPLIED" | "INTERVIEWING" | "OFFER" | "REJECTED";
    };

    if (!name) return res.status(400).json({ message: "Name is required" });

    const contact = await prisma.contact.create({
      data: {
        name: name,
        company: company ?? null,
        status: status ?? "SAVED",
        userId,
      },
      select: { id: true, name: true, company: true, status: true, createdAt: true },
    });

    res.status(201).json(contact);
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "Could not create contact" });
  }
});