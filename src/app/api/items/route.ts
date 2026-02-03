import { NextResponse } from "next/server";
import { getItems, updateItemStatus, addItem } from "@/data/items";
import { getDb } from "@/lib/db";
import { seedDatabase } from "@/lib/seed";

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
    const { id, status } = body;

    if (!id || !status) {
      return NextResponse.json(
        { error: "Missing id or status" },
        { status: 400 }
      );
    }

    const item = await updateItemStatus(id, status);
    if (!item) {
      return NextResponse.json({ error: "Item not found" }, { status: 404 });
    }

    return NextResponse.json(item);
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
