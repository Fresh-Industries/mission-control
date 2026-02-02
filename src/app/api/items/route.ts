import { NextResponse } from "next/server";
import { getItems, updateItemStatus, addItem } from "@/data/items";

export async function GET() {
  const items = getItems();
  return NextResponse.json(items);
}

export async function PATCH(request: Request) {
  const body = await request.json();
  const { id, status } = body;

  if (!id || !status) {
    return NextResponse.json(
      { error: "Missing id or status" },
      { status: 400 }
    );
  }

  const item = updateItemStatus(id, status);
  if (!item) {
    return NextResponse.json({ error: "Item not found" }, { status: 404 });
  }

  return NextResponse.json(item);
}

export async function POST(request: Request) {
  const body = await request.json();
  const item = addItem(body);
  return NextResponse.json(item, { status: 201 });
}
