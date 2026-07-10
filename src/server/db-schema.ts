import {
  pgTable,
  varchar,
  text,
  timestamp,
  integer,
  pgEnum,
  index,
} from "drizzle-orm/pg-core";

export const issueStatusEnum = pgEnum("issue_status", [
  "backlog",
  "todo",
  "in_progress",
  "in_review",
  "done",
  "cancelled",
]);

export const issuePriorityEnum = pgEnum("issue_priority", [
  "urgent",
  "high",
  "medium",
  "low",
  "none",
]);

export const users = pgTable("users", {
  id: varchar("id", { length: 255 }).primaryKey(),
  email: varchar("email", { length: 320 }).notNull().unique(),
  name: varchar("name", { length: 255 }).notNull(),
  avatarUrl: text("avatar_url"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

export const projects = pgTable(
  "projects",
  {
    id: varchar("id", { length: 36 }).primaryKey(),
    name: varchar("name", { length: 255 }).notNull(),
    slug: varchar("slug", { length: 255 }).notNull().unique(),
    description: text("description"),
    color: varchar("color", { length: 7 }).default("#7c3aed").notNull(),
    icon: varchar("icon", { length: 10 }).default("🚀").notNull(),
    ownerId: varchar("owner_id", { length: 255 })
      .references(() => users.id)
      .notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (t) => [index("projects_owner_idx").on(t.ownerId)]
);

export const issues = pgTable(
  "issues",
  {
    id: varchar("id", { length: 36 }).primaryKey(),
    number: integer("number").notNull(),
    title: varchar("title", { length: 500 }).notNull(),
    description: text("description"),
    status: issueStatusEnum("status").default("backlog").notNull(),
    priority: issuePriorityEnum("priority").default("none").notNull(),
    projectId: varchar("project_id", { length: 36 })
      .references(() => projects.id, { onDelete: "cascade" })
      .notNull(),
    assigneeId: varchar("assignee_id", { length: 255 }).references(
      () => users.id
    ),
    createdBy: varchar("created_by", { length: 255 })
      .references(() => users.id)
      .notNull(),
    labels: text("labels").array().default([]).notNull(),
    sortOrder: integer("sort_order").default(0).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    completedAt: timestamp("completed_at", { withTimezone: true }),
  },
  (t) => [
    index("issues_project_idx").on(t.projectId),
    index("issues_assignee_idx").on(t.assigneeId),
    index("issues_status_idx").on(t.status),
  ]
);

export type User = typeof users.$inferSelect;
export type Project = typeof projects.$inferSelect;
export type Issue = typeof issues.$inferSelect;
export type IssueStatus = (typeof issueStatusEnum.enumValues)[number];
export type IssuePriority = (typeof issuePriorityEnum.enumValues)[number];
