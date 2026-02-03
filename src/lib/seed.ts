import { sql } from "drizzle-orm";
import { getDb } from "./db";
import { missionItems } from "./schema";
import { seedInitialData } from "./seed-data";

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

const driveFiles = [
  {
    name: "Drive-Filelist.md",
    content: `# Fresh Industries Google Drive Resources

## Account
- **Email:** hello@freshindustries.co
- Use \`gog\` CLI with keyring for auth

## Documents
1. **InflateMate Features** - Complete feature spec
2. **First Initial Leads** - 84 businesses, qualification status
3. **Cold Outreach Email Templates** - v2 templates
4. **Marketing Videos** - Promotional assets
5. **Dashboard Screenshots** - Hero, inventory system

## Using gog CLI
\`\`\`bash
gog drive list
gog drive read <file-id>
\`\`\`
`,
  },
];

const osFiles = [
  {
    name: "Operating-System-2026.md",
    content: `# Fresh Industries 2026 Operating System

## North Star
By end of 2026: InflateMate = primary income, life feels calm and ordered.

## The 5 Pillars

### 1. BUILDER
- Target: 30-50 customers, $4k-$7k MRR
- Weekly: Ship something, talk to 1 customer

### 2. SCHOLAR
- CS fundamentals, from-scratch projects
- Reading: 15 books planned

### 3. WARRIOR
- Train 4-5x per week
- Run 3-5 miles

### 4. PARTNER
- Weekly protected time with girlfriend
- Clear family boundaries

### 5. SPIRIT
- NT reading: 1 chapter/day
- Prayer: 5 min daily

## Weekly Structure
- **Monday:** Deep Build
- **Tuesday:** Customer & Fixes
- **Wednesday:** Ship & Create
- **Thursday:** Learning
- **Friday:** Review & Relationships
`,
  },
];

export async function seedDatabase() {
  const db = getDb();

  // Create table if not exists
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS mission_items (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      description TEXT,
      category TEXT NOT NULL CHECK (category IN ('feature', 'workflow', 'template', 'research', 'automation')),
      status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in-progress', 'approved', 'rejected')),
      notes TEXT,
      link TEXT,
      files JSONB,
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW()
    )
  `);

  // Add files column if it doesn't exist (for existing tables)
  await db.execute(sql`
    ALTER TABLE mission_items ADD COLUMN IF NOT EXISTS files JSONB
  `);

  // Create indexes if not exist
  await db.execute(sql`
    CREATE INDEX IF NOT EXISTS idx_mission_items_status ON mission_items(status)
  `);
  await db.execute(sql`
    CREATE INDEX IF NOT EXISTS idx_mission_items_category ON mission_items(category)
  `);

  // Seed initial data
  await seedInitialData();

  // Add files to existing items that don't have them
  await db
    .update(missionItems)
    .set({ files: sql`COALESCE(${missionItems.files}, '[]'::jsonb)` })
    .where(sql`${missionItems.id} = 'lead-1'`);

  await db
    .update(missionItems)
    .set({ files: emailTemplates })
    .where(sql`${missionItems.id} = 'lead-1'`);

  await db
    .update(missionItems)
    .set({ files: driveFiles })
    .where(sql`${missionItems.id} = 'fresh-2'`);

  await db
    .update(missionItems)
    .set({ files: osFiles })
    .where(sql`${missionItems.id} = 'fresh-1'`);
}
