import { NextResponse } from "next/server";
import { getItems, updateItemStatus, addItem, updateItemNotes } from "@/data/items";
import { getDb } from "@/lib/db";
import { seedDatabase } from "@/lib/seed";
import type { MissionItem } from "@/lib/schema";

// Force dynamic rendering to avoid build-time DB connection
export const dynamic = "force-dynamic";

// Seed database on module load (runs once per server start)
let seeded = false;
async function ensureSeeded() {
  if (!seeded) {
    try {
      await seedDatabase();
      seeded = true;
    } catch (error) {
      console.error("Seed error:", error);
    }
  }
}

// Trigger workflow based on item category
async function triggerApprovalWorkflow(item: MissionItem): Promise<string> {
  const timestamp = new Date().toISOString();
  let triggerLog = "";

  switch (item.category) {
    case "feature":
      triggerLog = `[${timestamp}] APPROVAL TRIGGER: Feature - Would create GitHub issue/PR stub for "${item.title}"`;
      break;
    case "workflow":
      triggerLog = `[${timestamp}] APPROVAL TRIGGER: Workflow - Spawning sub-agent to execute workflow for "${item.title}"`;
      // In production, this would call sessions_spawn API
      break;
    case "template":
      triggerLog = `[${timestamp}] APPROVAL TRIGGER: Template - No action needed, marked complete for "${item.title}"`;
      break;
    case "research":
      triggerLog = `[${timestamp}] APPROVAL TRIGGER: Research - Spawning research sub-agent for "${item.title}"`;
      // In production, this would call sessions_spawn API
      break;
    case "automation":
      triggerLog = `[${timestamp}] APPROVAL TRIGGER: Automation - Would create cron job stub for "${item.title}"`;
      // In production, this would create a cron job
      break;
  }

  return triggerLog;
}

export async function GET() {
  try {
    await ensureSeeded();
    getDb();
    const items = await getItems();
    return NextResponse.json(items);
  } catch (error) {
    console.error("Database error:", error);
    return NextResponse.json(
      { error: "Failed to fetch items" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  try {
    await ensureSeeded();
    const body = await request.json();
    const { id, status, notes } = body;

    if (!id) {
      return NextResponse.json(
        { error: "Missing id" },
        { status: 400 }
      );
    }

    // Handle status change with workflow trigger
    if (status) {
      const item = await updateItemStatus(id, status);
      if (!item) {
        return NextResponse.json({ error: "Item not found" }, { status: 404 });
      }

      // Trigger workflow if approved
      if (status === "approved") {
        const triggerLog = await triggerApprovalWorkflow(item);
        const currentNotes = item.notes || "";
        const updatedNotes = currentNotes
          ? `${currentNotes}\n\n${triggerLog}`
          : triggerLog;
        
        await updateItemNotes(id, updatedNotes);
        return NextResponse.json({ ...item, notes: updatedNotes });
      }

      return NextResponse.json(item);
    }

    // Handle notes update
    if (notes !== undefined) {
      const item = await updateItemNotes(id, notes);
      if (!item) {
        return NextResponse.json({ error: "Item not found" }, { status: 404 });
      }
      return NextResponse.json(item);
    }

    return NextResponse.json(
      { error: "Nothing to update" },
      { status: 400 }
    );
  } catch (error) {
    console.error("Database error:", error);
    return NextResponse.json(
      { error: "Failed to update item" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    await ensureSeeded();
    const body = await request.json();
    const item = await addItem(body);
    return NextResponse.json(item, { status: 201 });
  } catch (error) {
    console.error("Database error:", error);
    return NextResponse.json(
      { error: "Failed to create item" },
      { status: 500 }
    );
  }
}
