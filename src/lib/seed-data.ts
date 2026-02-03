import { getDb } from "./db";
import { missionItems } from "./schema";
import { sql } from "drizzle-orm";

const seedData = [
  // Lead Nurturing
  {
    id: "lead-1",
    title: "Lead Nurturing Email Sequence",
    description: "5-email cold outreach sequence over 18 days",
    category: "workflow" as const,
    status: "pending" as const,
    notes: `## Email Sequence (18 days)
**Day 1:** Intro email - value prop, 1-sentence pitch
**Day 4:** Social proof - case study or metric
**Day 7:** Problem awareness - common pain point
**Day 12:** Soft ask - question or feedback request
**Day 18:** Final outreach - clear CTA

## Qualified Leads: 27/49 (55%)
- Lugo's Party Supplies - 210-316-1572
- Jamboree Party Adventures - jamboreepartyadventures@gmail.com
- Jump N Slide Texas - info@jumpnslidetexas.com
- EZ Moonwalk Rentals - ezmoonwalkrentals1@gmail.com
- Baker Bounce Rentals - 904-800-7602

## Deliverability Notes
- Start with warm-up mode (lower volume)
- Use dedicated sending domain if possible
- Templates in Google Drive: "Cold Outreach Email Templates v2"
- Monitor spam complaints closely`,
  },
  {
    id: "lead-2",
    title: "Lead Intelligence Tool",
    description: "Enrich leads with Apollo.io or Clearbit",
    category: "feature" as const,
    status: "pending" as const,
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
  // Automations
  {
    id: "auto-1",
    title: "Morning Briefing System",
    description: "Daily 8am briefing with weather, tasks, news",
    category: "automation" as const,
    status: "approved" as const,
    notes: `## 5-Section Format
1. **Trending** - YouTube trends, AI tools, industry news
2. **Current Events** - Day-specific news hook
3. **Deep Dive** - One technical or business topic
4. **Action Item** - 1 concrete thing to do today
5. **Your Pulse** - Energy check, mood check-in

## Cron Setup
- Schedule: 8:00 AM CT daily
- Requires: systemEvent payload (schema corrected)
- Sends to main session via OpenClaw cron
- Pending: Fix payload schema validation`,
  },
  {
    id: "auto-2",
    title: "Nightly Build Automation",
    description: "11pm CT build session with research → plan → execute",
    category: "automation" as const,
    status: "pending" as const,
    notes: `## Workflow
1. Research phase (15 min) - web search, docs review
2. Planning phase (10 min) - architectural decisions
3. Execution phase (35 min) - coding, testing

## Daily Tasks
- Review Mission Control dashboard
- Pick 1-2 items to work on
- Commit + push to GitHub
- Document progress in daily notes

## Model Priority
- Primary: Claude Opus 4.5 (google-antigravity)
- Fallback: Codex 5.2 (openai-codex)`,
  },
  // Research
  {
    id: "res-1",
    title: "AI Agents Research Report",
    description: "Deep dive on AI agents for customer follow-up",
    category: "research" as const,
    status: "approved" as const,
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
    id: "res-2",
    title: "InflateMate Competitor Analysis",
    description: "Research competitor features and pricing",
    category: "research" as const,
    status: "pending" as const,
    notes: `## Known Competitors
- **InflatableOffice** - Full ERP for party rentals
- **EventRentalSystems** - Enterprise rental management
- **Checkfront** -通用 booking platform
- **Square Appointments** - Basic online booking

## Differentiators to Highlight
- SMS-first communication
- AI-powered follow-up
- Simpler onboarding for small operators
- Better mobile experience

## Pricing Research
- Starter: All core features
- Growth: Custom domain, waiver, org members, marketing`,
  },
  // InflateMate Core
  {
    id: "inf-1",
    title: "InflateMate Onboarding Flow",
    description: "Simplified signup and first booking experience",
    category: "feature" as const,
    status: "pending" as const,
    notes: `## Current Pain Points
- Multi-step wizard overwhelms small operators
- Too many fields upfront
- No clear value proposition

## Proposed Flow
1. Email + business name (2 fields)
2. One-question qualification
3. Immediate access to dashboard
4. Progressive profile completion

## Success Metrics
- Time to first booking < 30 min
- Signup completion rate > 80%
- Day-7 retention > 50%`,
  },
  {
    id: "inf-2",
    title: "InflateMate CRM Improvements",
    description: "Customer tracking and communication history",
    category: "feature" as const,
    status: "pending" as const,
    notes: `## Required Features
1. Contact profile (name, email, phone, notes)
2. Communication timeline (calls, emails, SMS)
3. Booking history per customer
4. Follow-up reminders

## Nice to Have
- Lead source tracking
- Customer tags/labels
- Bulk actions (export, email)
- Notes with @mentions for team`,
  },
  // Templates
  {
    id: "temp-1",
    title: "Cold Outreach Email Templates",
    description: "Proven email templates for bounce house lead outreach",
    category: "template" as const,
    status: "pending" as const,
    notes: `## Template Collection
Collection of tested cold outreach emails for bounce house rental businesses.

## Usage Notes
- Personalize each email with owner name
- Keep subject lines under 50 characters
- A/B test subject lines weekly
- Track reply rates per template`,
    files: [
      {
        name: "intro-email.md",
        content: `# Intro Email Template

**Subject:** Quick question about {business_name}

Hi {owner_name},

I noticed {business_name} on Google and wanted to reach out.

I help party rental businesses like yours fill more weekends using simple SMS reminders and automated follow-ups.

**What if you could:**
- Reduce no-shows by 60%?
- Get more 5-star reviews automatically?
- Spend less time chasing payments?

I'd love to show you how InflateMate does this - no credit card required.

Would you be open to a 5-minute chat this week?

Best,
[Your Name]

---
*Reply "stop" to unsubscribe*`,
      },
      {
        name: "follow-up-1.md",
        content: `# Follow-up Email (Day 4)

**Subject:** {business_name} + automated reviews?

Hi {owner_name},

Following up on my last email - I know you're busy running {business_name}.

Just wanted to share that most bounce house operators using InflateMate see:
- **15+ more bookings/year** from automated review requests
- **90% fewer payment disputes** with clear SMS confirmations

Nothing to install. Works with your existing calendar.

Want me to show you a quick demo?

Best,
[Your Name]`,
      },
      {
        name: "final-outreach.md",
        content: `# Final Outreach Email (Day 18)

**Subject:** One last try - InflateMate for {business_name}

Hi {owner_name},

I've reached out a few times about InflateMate - I know your inbox is full.

**The TL;DR:**
Simple tool that texts customers reminders, collects reviews, and reduces no-shows. Free tier available.

If this isn't a priority right now, no worries. I'll check back in next quarter.

Best of luck with {business_name}!

Best,
[Your Name]

---
*P.S. - Reply "curious" if you want to see what it looks like*`,
      },
    ],
  },
  // Fresh Industries
  {
    id: "fresh-1",
    title: "2026 Operating System Review",
    description: "Monthly check-in on 5 pillars progress",
    category: "workflow" as const,
    status: "in-progress" as const,
    notes: `## 5 Pillars Progress (Feb 2026)

**1. BUILDER** (InflateMate)
- Target: 30-50 customers, $4k-$7k MRR
- Current: 27 qualified leads, cold outreach active
- This week: Send first email sequence

**2. SCHOLAR** (Learning)
- CS fundamentals roadmap in progress
- 1 from-scratch project: Mission Control ✓
- Reading: 15 books planned (6 tech, 4 business)

**3. WARRIOR** (Fitness)
- Training 4-5x per week
- Running 3-5 miles comfortably
- Sleep consistency priority

**4. PARTNER** (Relationships)
- Weekly protected time with girlfriend
- Clear family boundaries maintained

**5. SPIRIT** (Faith)
- NT reading: 1 chapter/day
- Prayer: 5 min daily
- Church community discernment ongoing`,
  },
  {
    id: "fresh-2",
    title: "Google Drive Resource Hub",
    description: "Organize Fresh Industries shared documents",
    category: "template" as const,
    status: "approved" as const,
    notes: `## Documents Available
1. **InflateMate Features** - Complete feature spec
2. **First Initial Leads** - 84 businesses, qualification status
3. **Cold Outreach Email Templates** - v2 templates
4. **Marketing Videos** - Promotional assets
5. **Dashboard Screenshots** - Hero, inventory system

## Access
- Account: hello@freshindustries.co
- Keyring: [REDACTED]
- CLI: gog (Google Workspace CLI)

## Cleanup Needed
- Remove duplicate templates
- Consolidate marketing assets
- Archive old campaign materials`,
  },
  {
    id: "fresh-3",
    title: "Mission Control Dashboard",
    description: "Second brain for Fresh Industries",
    category: "feature" as const,
    status: "in-progress" as const,
    notes: `## Features Implemented
✓ Dashboard UI with stats
✓ Item cards with categories
✓ Detail drawer with notes
✓ Approve/Reject actions
✓ PostgreSQL persistence
✓ 10-second polling

## Upcoming Features
- Trigger actions on approval (sub-agents, cron)
- Pull in data from memory files
- Lead status tracking
- Revenue metrics dashboard
- YouTube trend alerts

## Tech Stack
- Next.js 16.1.1 + TypeScript
- Tailwind CSS + shadcn/ui
- PostgreSQL on Railway
- Drizzle ORM`,
  },
];

export async function seedInitialData() {
  const db = getDb();

  // Check if data already exists
  const existing = await db.select().from(missionItems).limit(1);
  if (existing.length > 0) {
    console.log("Database already seeded, skipping...");
    return;
  }

  // Insert all seed data
  for (const item of seedData) {
    await db.insert(missionItems).values({
      id: sql`${item.id}`,
      title: item.title,
      description: item.description,
      category: item.category,
      status: item.status,
      notes: item.notes,
      files: item.files || null,
      createdAt: new Date(),
      updatedAt: new Date(),
      link: null,
    });
  }

  console.log(`Seeded ${seedData.length} items`);
}
