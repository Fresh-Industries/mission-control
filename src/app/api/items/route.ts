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
      triggerLog = `[${timestamp}] APPROVAL TRIGGER: Feature - Creating GitHub issue/PR for "${item.title}"`;
      // Create GitHub issue via API
      try {
        const response = await fetch("https://api.github.com/repos/Fresh-Industries/FitBet/issues", {
          method: "POST",
          headers: {
            "Authorization": `token ${process.env.GITHUB_TOKEN}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            title: `[Mission Control] ${item.title}`,
            body: item.description + "\n\n---\n\n_Approved via Mission Control Dashboard_",
            labels: ["mission-control"],
          }),
        });
        if (response.ok) {
          const issue = await response.json();
          triggerLog += `\n🔗 GitHub Issue: ${issue.html_url}`;
        }
      } catch (error) {
        triggerLog += `\n⚠️ GitHub issue creation failed: ${error}`;
      }
      break;
    case "workflow":
      triggerLog = `[${timestamp}] APPROVAL TRIGGER: Workflow - Spawning sub-agent for "${item.title}"`;
      // Spawn sub-agent via OpenClaw
      try {
        const response = await fetch("/api/sessions_spawn", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            label: `Execute: ${item.title}`,
            task: item.description + "\n\nNotes: " + (item.notes || ""),
          }),
        });
        if (response.ok) {
          const result = await response.json();
          triggerLog += `\n🤖 Sub-agent spawned: ${result.sessionKey || result.runId}`;
        }
      } catch (error) {
        triggerLog += `\n⚠️ Sub-agent spawn failed: ${error}`;
      }
      break;
    case "template":
      triggerLog = `[${timestamp}] APPROVAL TRIGGER: Template - No action needed, marked complete for "${item.title}"`;
      break;
    case "research":
      triggerLog = `[${timestamp}] APPROVAL TRIGGER: Research - Spawning research sub-agent for "${item.title}"`;
      // Spawn research sub-agent
      try {
        const response = await fetch("/api/sessions_spawn", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            label: `Research: ${item.title}`,
            task: `Research: ${item.description}\n\nContext: ${item.notes || ""}`,
          }),
        });
        if (response.ok) {
          const result = await response.json();
          triggerLog += `\n🤖 Research sub-agent spawned: ${result.sessionKey || result.runId}`;
        }
      } catch (error) {
        triggerLog += `\n⚠️ Research sub-agent spawn failed: ${error}`;
      }
      break;
    case "automation":
      triggerLog = `[${timestamp}] APPROVAL TRIGGER: Automation - Would create cron job for "${item.title}"`;
      // Log for cron job creation (would use cron API in production)
      triggerLog += `\n⏰ Cron job queued for creation`;
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
