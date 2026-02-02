export interface MissionItem {
  id: string;
  title: string;
  description: string;
  category: "feature" | "workflow" | "template" | "research" | "automation";
  status: "pending" | "in-progress" | "approved" | "rejected";
  created: string;
  updated: string;
  link?: string;
  notes?: string;
}

export const initialItems: MissionItem[] = [
  {
    id: "1",
    title: "Lead Nurturing Email Sequence",
    description: "5-email cold outreach sequence with n8n workflow automation",
    category: "workflow",
    status: "pending",
    created: "2026-02-02",
    updated: "2026-02-02",
    notes: "Based on Drive templates, optimized for cold email",
  },
  {
    id: "2",
    title: "Mission Control Dashboard",
    description: "Next.js dashboard with shadcn/ui for reviewing/approving work",
    category: "feature",
    status: "in-progress",
    created: "2026-02-02",
    updated: "2026-02-02",
  },
  {
    id: "3",
    title: "Morning Briefing System",
    description: "Daily 8am briefing with weather, tasks, news, and productivity tips",
    category: "automation",
    status: "approved",
    created: "2026-02-01",
    updated: "2026-02-01",
  },
  {
    id: "4",
    title: "AI Agents Research Report",
    description: "Deep dive on AI agents for customer follow-up automation",
    category: "research",
    status: "approved",
    created: "2026-02-01",
    updated: "2026-02-01",
  },
  {
    id: "5",
    title: "Lead Intelligence Tool",
    description: "Enrich leads with Apollo/Clearbit data for qualification",
    category: "feature",
    status: "pending",
    created: "2026-02-02",
    updated: "2026-02-02",
  },
];

let items = [...initialItems];

export function getItems() {
  return items;
}

export function updateItemStatus(
  id: string,
  status: MissionItem["status"]
): MissionItem | null {
  const item = items.find((i) => i.id === id);
  if (item) {
    item.status = status;
    item.updated = new Date().toISOString().split("T")[0];
  }
  return item || null;
}

export function addItem(
  item: Omit<MissionItem, "id" | "created" | "updated">
): MissionItem {
  const newItem: MissionItem = {
    ...item,
    id: Date.now().toString(),
    created: new Date().toISOString().split("T")[0],
    updated: new Date().toISOString().split("T")[0],
  };
  items = [newItem, ...items];
  return newItem;
}
