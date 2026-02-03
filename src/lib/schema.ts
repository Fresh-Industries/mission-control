import { pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

export const missionItems = pgTable("mission_items", {
  id: text("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  category: text("category").$type<
    "feature" | "workflow" | "template" | "research" | "automation"
  >(),
  status: text("status").$type<
    "pending" | "in-progress" | "approved" | "rejected"
  >(),
  notes: text("notes"),
  link: text("link"),
  createdAt: timestamp("created_at", { mode: "date" }).default(
    sql`CURRENT_TIMESTAMP`
  ),
  updatedAt: timestamp("updated_at", { mode: "date" }).default(
    sql`CURRENT_TIMESTAMP`
  ),
});

export type MissionItem = typeof missionItems.$inferSelect;
export type NewMissionItem = typeof missionItems.$inferInsert;
