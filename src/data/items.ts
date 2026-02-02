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
    notes: `## Email Sequence (18 days)
**Day 1:** Intro email - value prop, 1-sentence pitch
**Day 4:** Social proof - case study or metric
**Day 7:** Problem awareness - common pain point
**Day 12:** Soft ask - question or feedback request
**Day 18:** Final outreach - clear CTA

## Qualified Leads (27)
- Source: First Initial Leads PDF (84 → 49 checked)
- Criteria: Contact-only booking, no online system
- 55% qualification rate

## Deliverability Notes
- Start with warm-up mode (lower volume)
- Use dedicated sending domain if possible
- Monitor spam complaints closely
- Templates in Google Drive: "Cold Outreach Email Templates v2"`,
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
    notes: `## 5-Section Format
1. **Trending** - YouTube trends, AI tools, industry news
2. **Current Events** - Day-specific news hook
3. **Deep Dive** - One technical or business topic
4. **Action Item** - 1 concrete thing to do today
5. **Your Pulse** - Energy check, mood check-in

## Cron Setup
- Schedule: 8:00 AM CT daily
- Requires: systemEvent payload (schema corrected)
- Sends to main session via OpenClaw cron`,
  },
  {
    id: "4",
    title: "AI Agents Research Report",
    description: "Deep dive on AI agents for customer follow-up automation",
    category: "research",
    status: "approved",
    created: "2026-02-01",
    updated: "2026-02-01",
    notes: `## Research Status: COMPLETE

## InflateMate Roadmap - AI Features
1. **AI Follow-up Agent** - Automated response to inquiry emails
2. **Weather Alerts** - Proactive notifications for rain dates
3. **Dynamic Pricing** - Demand-based pricing suggestions
4. **SMS Reminders** - Automated booking confirmations

## Available Tools
- OpenClaw sub-agents for async research
- Deep Research agent (we-crafted.com/agents/deep-research)
- Gemini CLI for one-shot Q&A

## Next Step
Build n8n workflow with OpenClaw integration for automated follow-up`,
  },
  {
    id: "5",
    title: "Lead Intelligence Tool",
    description: "Enrich leads with Apollo/Clearbit data for qualification",
    category: "feature",
    status: "pending",
    created: "2026-02-02",
    updated: "2026-02-02",
    notes: `## Tools to Research
- **Apollo.io** - Contact/company enrichment, email discovery
- **Clearbit** - Company data, technographics, intent signals
- **Hunter** - Email verification, domain research

## Use Cases
1. Find direct email for bounce house owners
2. Discover their tech stack (Square, Wix, custom?)
3. Identify company size for ICP fit
4. Enrich qualified leads list with contact data

## Data Points Needed
- Owner name, email, phone
- Company revenue range
- Employee count
- Tech stack indicators`,
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
