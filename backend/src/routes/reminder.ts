import { Router } from "express";
import { PrismaClient } from "../../generated/prisma/client";
import { requireAuth } from "../auth";

const prisma = new PrismaClient();
export const reminderRouter = Router();

// Get all reminders for the authenticated user
reminderRouter.get("/", requireAuth, async (req, res) => {
  try {
    const { sub: userId } = (req as any).user as { sub: string };
    const take = Math.min(Number(req.query.limit) || 20, 100);
    const cursor = req.query.cursor as string | undefined;
    const status = req.query.status as "PENDING" | "COMPLETED" | "CANCELLED" | undefined;
    const type = req.query.type as "FOLLOW_UP" | "INTERVIEW" | "ASSESSMENT" | "DEADLINE" | "CALL" | "EMAIL" | "OTHER" | undefined;

    const where: any = { userId };
    if (status) where.status = status;
    if (type) where.type = type;

    const reminders = await prisma.reminder.findMany({
      where,
      orderBy: [{ dueDate: "asc" }, { id: "desc" }],
      take: take + 1,
      ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
      select: {
        id: true,
        title: true,
        description: true,
        type: true,
        status: true,
        dueDate: true,
        createdAt: true,
        updatedAt: true,
        job: {
          select: {
            id: true,
            title: true,
            company: true,
          },
        },
        contact: {
          select: {
            id: true,
            name: true,
            company: true,
          },
        },
      },
    });

    const nextCursor = reminders.length > take ? reminders[take].id : null;
    if (nextCursor) reminders.pop();

    res.json({ items: reminders, nextCursor });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "Could not fetch reminders" });
  }
});

// Get upcoming reminders for the authenticated user
reminderRouter.get("/upcoming", requireAuth, async (req, res) => {
  try {
    const { sub: userId } = (req as any).user as { sub: string };
    const limit = Math.min(Number(req.query.limit) || 10, 50);
    const daysAhead = Number(req.query.days) || 7;

    const upcomingDate = new Date();
    upcomingDate.setDate(upcomingDate.getDate() + daysAhead);

    const reminders = await prisma.reminder.findMany({
      where: {
        userId,
        status: "PENDING",
        dueDate: {
          gte: new Date(),
          lte: upcomingDate,
        },
      },
      take: limit,
      orderBy: { dueDate: "asc" },
      select: {
        id: true,
        title: true,
        description: true,
        type: true,
        status: true,
        dueDate: true,
        createdAt: true,
        updatedAt: true,
        job: {
          select: {
            id: true,
            title: true,
            company: true,
          },
        },
        contact: {
          select: {
            id: true,
            name: true,
            company: true,
          },
        },
      },
    });

    res.json(reminders);
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "Could not fetch upcoming reminders" });
  }
});

// Get a specific reminder by ID
reminderRouter.get("/:id", requireAuth, async (req, res) => {
  try {
    const { sub: userId } = (req as any).user as { sub: string };
    const reminderId = req.params.id;

    const reminder = await prisma.reminder.findUnique({
      where: { id: reminderId },
      select: {
        id: true,
        title: true,
        description: true,
        type: true,
        status: true,
        dueDate: true,
        userId: true,
        createdAt: true,
        updatedAt: true,
        job: {
          select: {
            id: true,
            title: true,
            company: true,
          },
        },
        contact: {
          select: {
            id: true,
            name: true,
            company: true,
          },
        },
      },
    });

    if (!reminder || reminder.userId !== userId) {
      return res.status(404).json({ message: "Reminder not found" });
    }

    // Remove userId from response
    const { userId: _, ...reminderResponse } = reminder;
    res.json(reminderResponse);
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "Could not fetch reminder" });
  }
});

// Create a new reminder
reminderRouter.post("/", requireAuth, async (req, res) => {
  try {
    const { sub: userId } = (req as any).user as { sub: string };
    const { title, description, type, dueDate, jobId, contactId } = req.body as {
      title: string;
      description?: string;
      type: "FOLLOW_UP" | "INTERVIEW" | "ASSESSMENT" | "DEADLINE" | "CALL" | "EMAIL" | "OTHER";
      dueDate: string;
      jobId?: string;
      contactId?: string;
    };

    if (!title || !type || !dueDate) {
      return res.status(400).json({ message: "Title, type, and dueDate are required" });
    }

    // Validate that jobId or contactId belongs to the user (if provided)
    if (jobId) {
      const job = await prisma.job.findUnique({ where: { id: jobId } });
      if (!job || job.userId !== userId) {
        return res.status(400).json({ message: "Invalid jobId" });
      }
    }

    if (contactId) {
      const contact = await prisma.contact.findUnique({ where: { id: contactId } });
      if (!contact || contact.userId !== userId) {
        return res.status(400).json({ message: "Invalid contactId" });
      }
    }

    const reminder = await prisma.reminder.create({
      data: {
        title,
        description: description ?? null,
        type,
        dueDate: new Date(dueDate),
        userId,
        jobId: jobId ?? null,
        contactId: contactId ?? null,
      },
      select: {
        id: true,
        title: true,
        description: true,
        type: true,
        status: true,
        dueDate: true,
        createdAt: true,
        updatedAt: true,
        job: {
          select: {
            id: true,
            title: true,
            company: true,
          },
        },
        contact: {
          select: {
            id: true,
            name: true,
            company: true,
          },
        },
      },
    });

    // increment user exp by 5 for creating a reminder
    try {
      await prisma.user.update({ where: { id: userId }, data: { exp: { increment: 5 } as any } });
    } catch (e) {
      console.error('Failed to increment user exp', e);
    }

    console.log("Created reminder:", reminder, "for user:", userId);
    res.status(201).json(reminder);
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "Could not create reminder" });
  }
});

// Update a reminder
reminderRouter.put("/:id", requireAuth, async (req, res) => {
  try {
    const { sub: userId } = (req as any).user as { sub: string };
    const reminderId = req.params.id;
    const { title, description, type, status, dueDate, jobId, contactId } = req.body as {
      title?: string;
      description?: string;
      type?: "FOLLOW_UP" | "INTERVIEW" | "ASSESSMENT" | "DEADLINE" | "CALL" | "EMAIL" | "OTHER";
      status?: "PENDING" | "COMPLETED" | "CANCELLED";
      dueDate?: string;
      jobId?: string;
      contactId?: string;
    };

    // Verify reminder exists and belongs to the user
    const existingReminder = await prisma.reminder.findUnique({
      where: { id: reminderId },
    });
    if (!existingReminder || existingReminder.userId !== userId) {
      return res.status(404).json({ message: "Reminder not found" });
    }

    // Validate that jobId or contactId belongs to the user (if provided)
    if (jobId !== undefined) {
      if (jobId) {
        const job = await prisma.job.findUnique({ where: { id: jobId } });
        if (!job || job.userId !== userId) {
          return res.status(400).json({ message: "Invalid jobId" });
        }
      }
    }

    if (contactId !== undefined) {
      if (contactId) {
        const contact = await prisma.contact.findUnique({ where: { id: contactId } });
        if (!contact || contact.userId !== userId) {
          return res.status(400).json({ message: "Invalid contactId" });
        }
      }
    }

    const updatedReminder = await prisma.reminder.update({
      where: { id: reminderId },
      data: {
        ...(title !== undefined ? { title } : {}),
        ...(description !== undefined ? { description } : {}),
        ...(type !== undefined ? { type } : {}),
        ...(status !== undefined ? { status } : {}),
        ...(dueDate !== undefined ? { dueDate: new Date(dueDate) } : {}),
        ...(jobId !== undefined ? { jobId } : {}),
        ...(contactId !== undefined ? { contactId } : {}),
      },
      select: {
        id: true,
        title: true,
        description: true,
        type: true,
        status: true,
        dueDate: true,
        createdAt: true,
        updatedAt: true,
        job: {
          select: {
            id: true,
            title: true,
            company: true,
          },
        },
        contact: {
          select: {
            id: true,
            name: true,
            company: true,
          },
        },
      },
    });

    console.log("Updated reminder:", updatedReminder, "for user:", userId);
    res.json(updatedReminder);
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "Could not update reminder" });
  }
});

// Delete a reminder
reminderRouter.delete("/:id", requireAuth, async (req, res) => {
  try {
    const { sub: userId } = (req as any).user as { sub: string };
    const reminderId = req.params.id;

    // Verify reminder exists and belongs to the user
    const existingReminder = await prisma.reminder.findUnique({
      where: { id: reminderId },
    });
    if (!existingReminder || existingReminder.userId !== userId) {
      return res.status(404).json({ message: "Reminder not found" });
    }

    await prisma.reminder.delete({ where: { id: reminderId } });
    res.status(204).end();
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "Could not delete reminder" });
  }
});
