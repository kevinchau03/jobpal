import { Router } from "express";
import { PrismaClient } from "../../generated/prisma/client";
import { requireAuth } from "../auth";

const prisma = new PrismaClient();
export const contactRouter = Router();

contactRouter.get("/", requireAuth, async (req, res) => {
  const { sub: userId } = (req as any).user as { sub: string };
  const take = Math.min(Number(req.query.limit) || 20, 100);
  const cursor = req.query.cursor as string | undefined;
  const statusParam = req.query.status as string | undefined;

  const validStatuses = ["REACHED_OUT", "IN_CONTACT", "NOT_INTERESTED", "INTERESTED", "FOLLOW_UP"];
  const isValidStatus = statusParam && validStatuses.includes(statusParam);

  const where: any = { userId, ...(isValidStatus ? { status: statusParam } : {}) };

  const contacts = await prisma.contact.findMany({
    where,
    orderBy: { createdAt: "desc" },
    take: take + 1,
    ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
    select: { 
      id: true, 
      name: true, 
      company: true, 
      linkedin: true, 
      phone: true, 
      email: true, 
      status: true, 
      reminders: {
        select: {
          id: true,
          title: true,
          description: true,
          dueDate: true,
          status: true,
          type: true,
          createdAt: true,
          updatedAt: true
        }, 
      },
      createdAt: true 
    },
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
    const { name, company, status, linkedin, phone, email } = req.body as {
      name: string;
      company?: string;
      status?: "REACHED_OUT" | "IN_CONTACT" | "NOT_INTERESTED" | "INTERESTED" | "FOLLOW_UP";
      linkedin?: string;
      phone?: string;
      email?: string;
    };

    if (!name) return res.status(400).json({ message: "Name is required" });

    const contact = await prisma.contact.create({
      data: {
        name: name,
        company: company ?? null,
        status: status ?? "REACHED_OUT",
        linkedin: linkedin ?? null,
        phone: phone ?? null,
        email: email ?? null, 
        userId,
      },
      select: { id: true, name: true, company: true, status: true, createdAt: true },
    });

    // increment user exp by 10 BEFORE responding
    try {
      await prisma.user.update({ where: { id: userId }, data: { exp: { increment: 10 } as any } });
    } catch (e) {
      console.error('Failed to increment user exp', e);
    }

    res.status(201).json(contact);
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "Could not create contact" });
  }
});

contactRouter.delete("/:id", requireAuth, async (req, res) => {
  try{
    const { sub: userId } = (req as any).user as { sub: string };
    const contactId = req.params.id;

    const contact = await prisma.contact.findFirst({ where: { id: contactId, userId } });
    if (!contact) {
      return res.status(404).json({ message: "Contact not found" });
    }

    await prisma.contact.delete({where:{ id: contactId }});
    res.status(204).end();
  } catch(e){
    console.error(e);
    res.status(500).json({ message: "Could not delete contact" });
  }
  
});

contactRouter.put("/:id", requireAuth, async (req, res) => {
  try {
    const { sub: userId } = (req as any).user as { sub: string };
    const contactId = req.params.id;
    const { name, company, status, linkedin, phone, email } = req.body as {
      name?: string;
      company?: string;
      status?: "REACHED_OUT" | "IN_CONTACT" | "NOT_INTERESTED" | "INTERESTED" | "FOLLOW_UP";
      linkedin?: string;
      phone?: string;
      email?: string;
    };
    const contact = await prisma.contact.findUnique({ where: { id: contactId } });

    if (!contact || contact.userId !== userId) {
      return res.status(404).json({ message: "Contact not found" });
    }

    const updatedContact = await prisma.contact.update({
      where: { id: contactId },
      data: {
        name: name ?? contact.name,
        company: company ?? contact.company,
        status: status ?? contact.status,
        linkedin: linkedin ?? contact.linkedin,
        phone: phone ?? contact.phone,
        email: email ?? contact.email,
      },
      select: { id: true, name: true, company: true, status: true, createdAt: true },
    });
    res.json(updatedContact);

  }
  catch (e) {
    console.error(e);
    res.status(500).json({ message: "Could not update contact" });
  }
  });