import { getDb } from "./db";
import { missionItems } from "./schema";
import { sql } from "drizzle-orm";

const emailTemplates = [
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
];

export async function addFilesToItems() {
  const db = getDb();

  // Add files to Lead Nurturing Email Sequence
  await db
    .update(missionItems)
    .set({ files: emailTemplates })
    .where(sql`${missionItems.id} = 'lead-1'`);
  console.log("Added email templates to Lead Nurturing item");

  // Add files to Google Drive Resource Hub
  const driveFiles = [
    {
      name: "Drive-Filelist.md",
      content: `# Fresh Industries Google Drive Resources

## Account
- **Email:** hello@freshindustries.co
- **Keyring:** [REDACTED]

## Documents
1. **InflateMate Features** - Complete feature spec (booking system, CRM, payments, website builder, marketing hub, roadmap)
2. **First Initial Leads** - 84 businesses identified, lead list with qualification status
3. **Cold Outreach Email Templates** - v2 templates for email campaigns
4. **Email Templates Top 10** - Top 10 email outreach templates
5. **Marketing Videos** - Promotional videos for various InflateMate features
6. **Dashboard Screenshots** - Hero dashboard, inventory system screenshots

## Using gog CLI
\`\`\`bash
export GOG_KEYRING_PASSWORD=[REDACTED]
gog drive list
gog drive read <file-id>
\`\`\`
`,
    },
  ];

  await db
    .update(missionItems)
    .set({ files: driveFiles })
    .where(sql`${missionItems.id} = 'fresh-2'`);
  console.log("Added Drive file list to Google Drive Resource Hub item");

  // Add files to Operating System Review
  const osFiles = [
    {
      name: "Operating-System-2026.md",
      content: `# Fresh Industries 2026 Operating System

## North Star
By end of 2026: InflateMate = primary income, life feels calm and ordered, confidence grounded in proof.

## The 5 Pillars (Non-Negotiable)

### 1. BUILDER — Business & Ownership (PRIMARY)
- Target: 30-50 paying customers, $4k-$7k MRR, <5% churn
- ICP: Small party/inflatable rental operators
- Focus: Onboarding, retention, revenue
- Weekly: Ship something, talk to 1 customer, remove friction

### 2. SCHOLAR — Foundations & Thinking
- Finish 6-month CS fundamentals roadmap
- Build 1 from-scratch systems project
- Publish 6-12 short notes (proof, not popularity)
- Reading: 15 books (6 tech, 4 business, 3 philosophy, 2 wildcard)

### 3. WARRIOR — Body, Discipline, Energy
- Train 4-5x per week consistently
- Run 3-5 miles comfortably
- Sleep consistency over perfection
- "Miss days, never miss weeks"

### 4. PARTNER — Relationships & Stability
- Weekly protected time with girlfriend (phone-free)
- Clear family boundaries
- One non-tech social anchor

### 5. SPIRIT — Orientation & Grounding
- Read entire New Testament (1 chapter/day)
- Pray daily (5 min: gratitude, guidance, silence)
- Discern church community, baptism by end of 2026

## Daily Minimum
- Move body
- Touch InflateMate
- Read 1 NT chapter
- Pray 5 min
- Read 10 pages or 15 min
- 5-10 min journal dump

## Weekly Structure
- **Monday:** Deep Build (core work)
- **Tuesday:** Customer & Fixes
- **Wednesday:** Ship & Create
- **Thursday:** Learning (CS fundamentals)
- **Friday:** Review & Relationships
`,
    },
  ];

  await db
    .update(missionItems)
    .set({ files: osFiles })
    .where(sql`${missionItems.id} = 'fresh-1'`);
  console.log("Added Operating System file to 2026 OS Review item");

  console.log("Migration complete!");
}

// Run if called directly
if (require.main === module) {
  addFilesToItems()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error(err);
      process.exit(1);
    });
}
