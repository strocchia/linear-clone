import { createServerFn } from "@tanstack/react-start";
import { auth, clerkClient } from "@clerk/tanstack-react-start/server";
import { db } from "../db";
import { projects, users } from "../db-schema";
import { eq, and, desc } from "drizzle-orm";
import { z } from "zod";

export const getProjects = createServerFn({ method: "GET" }).handler(
  async () => {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    return db
      .select()
      .from(projects)
      .where(eq(projects.ownerId, userId))
      .orderBy(desc(projects.createdAt));
  },
);

export const getProjectBySlug = createServerFn({ method: "GET" })
  .validator(z.object({ slug: z.string() }))
  .handler(async ({ data }) => {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    const result = await db
      .select()
      .from(projects)
      .where(and(eq(projects.slug, data.slug), eq(projects.ownerId, userId)))
      .limit(1);

    return result[0] ?? null;
  });

export const createProject = createServerFn({ method: "POST" })
  .validator(
    z.object({
      name: z.string().min(1).max(255),
      slug: z
        .string()
        .min(1)
        .max(255)
        .regex(/^[a-z0-9-]+$/),
      description: z.string().optional(),
      color: z.string().default("#7c3aed"),
      icon: z.string().default("🚀"),
    }),
  )
  .handler(async ({ data }) => {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    const id = crypto.randomUUID();

    await db.insert(projects).values({
      id,
      ...data,
      ownerId: userId,
    });

    return db
      .select()
      .from(projects)
      .where(eq(projects.id, id))
      .limit(1)
      .then((r) => r[0]);
  });

export const updateProject = createServerFn({ method: "POST" })
  .validator(
    z.object({
      id: z.string(),
      name: z.string().min(1).max(255).optional(),
      description: z.string().optional(),
      color: z.string().optional(),
      icon: z.string().optional(),
    }),
  )
  .handler(async ({ data }) => {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    const { id, ...updates } = data;
    await db
      .update(projects)
      .set({ ...updates, updatedAt: new Date() })
      .where(and(eq(projects.id, id), eq(projects.ownerId, userId)));

    return db
      .select()
      .from(projects)
      .where(eq(projects.id, id))
      .limit(1)
      .then((r) => r[0]);
  });

export const deleteProject = createServerFn({ method: "POST" })
  .validator(z.object({ id: z.string() }))
  .handler(async ({ data }) => {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    await db
      .delete(projects)
      .where(and(eq(projects.id, data.id), eq(projects.ownerId, userId)));
  });

export const ensureUser = createServerFn({ method: "POST" }).handler(
  async () => {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    const existing = await db
      .select()
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    if (existing.length > 0) return existing[0];

    // Clerk provides user data via the session
    // For now insert with placeholder - in production you'd use Clerk's getUser()
    const client = await clerkClient();
    const clerkUser = await client.users.getUser(userId);

    const email =
      clerkUser.emailAddresses.find(
        (e) => e.id === clerkUser.primaryEmailAddressId,
      )?.emailAddress ?? "unknown";

    const name =
      [clerkUser.firstName, clerkUser.lastName].filter(Boolean).join(" ") ||
      clerkUser.username ||
      "User";

    const avatarUrl = clerkUser.imageUrl || null;

    const newUser = {
      id: userId,
      email,
      name,
      avatarUrl,
    };

    await db.insert(users).values(newUser).onConflictDoNothing();

    return newUser;
  },
);
