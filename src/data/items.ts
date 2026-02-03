import { getDb, missionItems } from "@/lib/db";
import { eq, desc } from "drizzle-orm";
import type { MissionItem } from "@/lib/schema";

const db = getDb();

export async function getItems(): Promise<MissionItem[]> {
  const items = await db
    .select()
    .from(missionItems)
    .orderBy(desc(missionItems.createdAt));
  return items;
}

export async function updateItemStatus(
  id: string,
  status: MissionItem["status"]
): Promise<MissionItem | null> {
  const updated = await db
    .update(missionItems)
    .set({ status, updatedAt: new Date() })
    .where(eq(missionItems.id, id))
    .returning();
  return updated[0] || null;
}

export async function addItem(
  item: Omit<MissionItem, "id" | "createdAt" | "updatedAt">
): Promise<MissionItem> {
  const newItem = await db
    .insert(missionItems)
    .values({
      id: Date.now().toString(),
      ...item,
      createdAt: new Date(),
      updatedAt: new Date(),
    })
    .returning();
  return newItem[0];
}

export async function getItemById(id: string): Promise<MissionItem | null> {
  const items = await db
    .select()
    .from(missionItems)
    .where(eq(missionItems.id, id));
  return items[0] || null;
}
