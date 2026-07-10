import { createServerFn } from "@tanstack/react-start";
import { auth } from "@clerk/tanstack-react-start/server";
import { db } from "../db";
import { issues, projects } from "../db-schema";
import { eq, desc, count, sql } from "drizzle-orm";
import { z } from "zod";

export const getIssuesByProject = createServerFn({ method: "GET" })
  .validator(z.object({ projectId: z.string() }))
  .handler(async ({ data }) => {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    return db
      .select()
      .from(issues)
      .where(eq(issues.projectId, data.projectId))
      .orderBy(issues.sortOrder, desc(issues.createdAt));
  });

export const getAllIssues = createServerFn({ method: "GET" }).handler(
  async () => {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    // Get all issues from user's projects
    const userProjects = await db
      .select({ id: projects.id })
      .from(projects)
      .where(eq(projects.ownerId, userId));

    const projectIds = userProjects.map((p) => p.id);
    if (projectIds.length === 0) return [];

    return db
      .select()
      .from(issues)
      .where(sql`${issues.projectId} IN ${projectIds}`)
      .orderBy(desc(issues.createdAt));
  }
);

export const getIssueById = createServerFn({ method: "GET" })
  .validator(z.object({ id: z.string() }))
  .handler(async ({ data }) => {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    const result = await db
      .select()
      .from(issues)
      .where(eq(issues.id, data.id))
      .limit(1);

    return result[0] ?? null;
  });

export const createIssue = createServerFn({ method: "POST" })
  .validator(
    z.object({
      projectId: z.string(),
      title: z.string().min(1).max(500),
      description: z.string().optional(),
      status: z.enum(["backlog", "todo", "in_progress", "in_review", "done", "cancelled"]).optional(),
      priority: z.enum(["urgent", "high", "medium", "low", "none"]).optional(),
      assigneeId: z.string().optional(),
      labels: z.array(z.string()).optional(),
    })
  )
  .handler(async ({ data }) => {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    const id = crypto.randomUUID();

    // Get next issue number for this project
    const maxNumber = await db
      .select({ maxNum: sql<number>`coalesce(max(${issues.number}), 0)` })
      .from(issues)
      .where(eq(issues.projectId, data.projectId));

    const nextNumber = (maxNumber[0]?.maxNum ?? 0) + 1;

    await db.insert(issues).values({
      id,
      number: nextNumber,
      projectId: data.projectId,
      title: data.title,
      description: data.description,
      status: data.status ?? "backlog",
      priority: data.priority ?? "none",
      assigneeId: data.assigneeId,
      createdBy: userId,
      labels: data.labels ?? [],
    });

    return db.select().from(issues).where(eq(issues.id, id)).limit(1).then((r) => r[0]);
  });

export const updateIssue = createServerFn({ method: "POST" })
  .validator(
    z.object({
      id: z.string(),
      title: z.string().min(1).max(500).optional(),
      description: z.string().optional(),
      status: z.enum(["backlog", "todo", "in_progress", "in_review", "done", "cancelled"]).optional(),
      priority: z.enum(["urgent", "high", "medium", "low", "none"]).optional(),
      assigneeId: z.string().nullable().optional(),
      labels: z.array(z.string()).optional(),
      sortOrder: z.number().optional(),
    })
  )
  .handler(async ({ data }) => {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    const { id, ...updates } = data;

    // Set completedAt when status changes to done
    if (updates.status === "done") {
      (updates as Record<string, unknown>).completedAt = new Date();
    }

    await db
      .update(issues)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(issues.id, id));

    return db.select().from(issues).where(eq(issues.id, id)).limit(1).then((r) => r[0]);
  });

export const deleteIssue = createServerFn({ method: "POST" })
  .validator(z.object({ id: z.string() }))
  .handler(async ({ data }) => {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    await db.delete(issues).where(eq(issues.id, data.id));
  });

export const getIssueCountsByProject = createServerFn({ method: "GET" }).handler(
  async () => {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    const userProjects = await db
      .select({ id: projects.id })
      .from(projects)
      .where(eq(projects.ownerId, userId));

    const projectIds = userProjects.map((p) => p.id);
    if (projectIds.length === 0) return [];

    return db
      .select({
        projectId: issues.projectId,
        status: issues.status,
        count: count(),
      })
      .from(issues)
      .where(sql`${issues.projectId} IN ${projectIds}`)
      .groupBy(issues.projectId, issues.status);
  }
);
