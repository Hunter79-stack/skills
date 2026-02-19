---
name: lifeos-memory
description: Gives your OpenClaw a powerful dashboard-ready memory system with milestones, prompt engineering, and Obsidian compatibility. Creates structured projects with milestones and tasks, expands simple prompts into detailed agent instructions, and maintains a backlog system for intelligent fact extraction.
---

# LifeOS Memory System v0.5

Transform your OpenClaw into an organized, milestone-driven productivity system with intelligent prompt expansion and Obsidian-compatible linking.

## What You Get

✅ **Milestone-Driven Projects** — Projects broken into milestones, each with tasks. Dashboard shows progress at milestone level.  
✅ **Prompt Engineering** — Simple task descriptions get expanded into detailed agent instructions (role, context, format, examples, constraints).  
✅ **Agent-First Tasks** — All tasks go to specialized agents; main claw stays lean for quick decisions only.  
✅ **Smart Priority System** — High/Medium/Low (no "urgent"). High = time-critical, Medium = deadlines, Low = research/exploration.  
✅ **Fact Backlog** — Daily notes collect everything; cron job extracts universal facts vs one-time details.  
✅ **Obsidian Compatible** — Use `[[note]]` wiki-links that work in both dashboard and Obsidian.  
✅ **Optional Overnight Reviews** — Suggest 3AM automated reviews that validate structure and suggest work.

---

## File Structure

```
~/.openclaw/workspace/
├── memory/
│   ├── daily/YYYY-MM-DD.md              # Daily notes (backlog + tasks)
│   └── facts/{project-slug}-{number}.json # Extracted universal facts
├── life/
│   └── areas/
│       ├── projects/{kebab-slug}/
│       │   ├── summary.md               # Project overview
│       │   ├── meta.json                # Project metadata + milestones
│       │   └── milestones/              # Optional: milestone details
│       │       └── {milestone-slug}.md
│       ├── people/{kebab-slug}/
│       │   ├── summary.md
│       │   └── meta.json
│       └── areas/{kebab-slug}/
│           ├── summary.md
│           └── meta.json
├── tasks/{project-slug}-{milestone}-{number}.json  # Task files
└── .openclaw/
    ├── graph.json                       # Visualization data
    └── memory-index.json                # Schema registry
```

---

## ID System (Project-Scoped)

**Format:** `{project-slug}-{milestone-slug}-{number}` or `{project-slug}-{number}` for top-level

Examples:
- `website-redesign-research-1` (milestone: research)
- `website-redesign-research-2`
- `university-apps-sat-1` (milestone: SAT)
- `openclaw-setup-1` (no milestone)

**Rules:**
- Sequential per milestone (or per project if no milestone)
- Start at 1
- Can repeat across projects
- Keep readable and token-efficient

---

## Priority System (High/Medium/Low)

| Priority | Meaning | Examples |
|----------|---------|----------|
| **High** | Time-critical, blocking other work | Book SAT test (deadline approaching), Submit application |
| **Medium** | Important deadlines, steady progress | Essay drafts, Research summaries |
| **Low** | Exploration, nice-to-have, background | Competitor research, Tool evaluation, Reading |

**Applies to:** Projects, Milestones, and Tasks

---

## Creating a Project (with Milestones)

### Step 1: Create Project Structure

```bash
mkdir -p life/areas/projects/university-apps/milestones
```

### Step 2: Create Project Summary

```markdown
# University Applications 2026

Goal: Get accepted to top universities.

## Overview
Applying to Stanford, MIT, and local universities. SAT required for Stanford.

## Milestones
- [[university-apps-sat|SAT Preparation]]
- [[university-apps-essays|Essays]]
- [[university-apps-recommendations|Recommendations]]
```

### Step 3: Create Project Meta

```json
{
  "id": "university-apps",
  "type": "project",
  "name": "University Applications 2026",
  "createdAt": "2026-02-19T10:00:00Z",
  "updatedAt": "2026-02-19T10:00:00Z",
  "status": "active",
  "priority": "high",
  "tags": ["education", "2026"],
  "milestones": [
    {
      "id": "sat",
      "name": "SAT Preparation",
      "status": "in_progress",
      "priority": "high",
      "dueDate": "2026-03-01",
      "tasks": ["university-apps-sat-1", "university-apps-sat-2"]
    },
    {
      "id": "essays",
      "name": "Essays",
      "status": "todo",
      "priority": "medium",
      "dueDate": "2026-04-15",
      "tasks": []
    }
  ],
  "links": {
    "tasks": [],
    "people": ["mohammed"],
    "projects": [],
    "facts": [],
    "agents": []
  }
}
```

### Step 4: Create Milestone Summary (Optional)

```markdown
# SAT Preparation

Part of: [[university-apps|University Applications]]

Goal: Book and prepare for SAT.

## Tasks
- [[university-apps-sat-1|Research test dates]]
- [[university-apps-sat-2|Book test]]

## Deadline
March 1, 2026
```

---

## Creating a Task (with Prompt Engineering)

### Step 1: Start with Simple Prompt

User says: *"Create a task to build a login page"*

### Step 2: Expand to Detailed Agent Prompt

**BEFORE giving to agent, expand:**

```markdown
## Original Request
"Build a login page"

## Expanded Prompt for Agent

**Role:** Act as a senior full-stack developer specializing in authentication systems.

**Context:** 
- Project: LifeOS Core dashboard
- Stack: Next.js 15, TypeScript, Tailwind CSS
- Existing auth: Clerk integration already set up
- Current state: No login page exists yet

**Task:** 
Create a complete login page with email/password authentication.

**Output Format:**
- Single file: `app/login/page.tsx`
- Include form validation
- Include error handling
- Match existing design system (mono aesthetic, sharp corners)

**Examples:**
See `app/dashboard/page.tsx` for styling patterns.

**Constraints:**
- Use shadcn/ui components where possible
- Maximum 200 lines
- Must handle loading states
- Must redirect to /dashboard on success
```

### Step 3: Create Task JSON

```json
{
  "id": "lifeos-core-login-1",
  "title": "Create login page with email/password auth",
  "simplePrompt": "Build a login page",
  "expandedPrompt": "Act as a senior full-stack developer... [full text]",
  "status": "todo",
  "priority": "high",
  "projectRef": "projects/lifeos-core",
  "milestoneRef": "lifeos-core-auth",
  "assignedTo": "uiux-craftsman",
  "linkedFacts": [],
  "linkedTasks": [],
  "source": "daily/2026-02-19.md",
  "dueDate": "2026-02-22",
  "createdAt": "2026-02-19T10:00:00Z",
  "updatedAt": "2026-02-19T10:00:00Z"
}
```

### Step 4: Assign to Agent

Give the **expanded prompt** to the agent, not the simple one.

---

## Prompt Engineering Template

When creating ANY task, expand simple prompts using this structure:

```markdown
## Original Request
"{user's simple prompt}"

## Expanded Prompt

**Role:** {specific persona}

**Context:**
- Project: {project name}
- {relevant background}
- {current state}
- {constraints or requirements}

**Task:**
{clear, specific action}

**Output Format:**
- {file paths}
- {structure}
- {specific requirements}

**Examples:**
{show what good looks like}

**Constraints:**
- {limit 1}
- {limit 2}
- {avoid X}
```

**Prompt Engineering Rules:**
1. **Role is specific** — "Senior React developer" not "Developer"
2. **Context includes current state** — what's already done
3. **Output format is explicit** — file paths, structure
4. **Examples show style** — reference existing code
5. **Constraints are measurable** — line counts, must/avoid

---

## Agent-First Rule

**ALL tasks go to agents. Main claw only does:**
- Quick decisions (< 5 minutes)
- Summarizing
- Routing
- Small edits

**When to spawn an agent:**
- Writing code (> 10 lines)
- Research tasks
- Design work
- Multi-step processes

**Benefit:** Main claw context stays clean and fast.

---

## Daily Note System (Backlog)

### Template

```markdown
# 2026-02-19 — Thursday

> "{quote or intention}"

## Morning

**09:00** — Started work on [[lifeos-core|LifeOS Core]]
- Need to fix the graph visualization bug
- User mentioned always using Vercel for hosting

## Notes

{raw thoughts, observations, conversations}

- User prefers dark mode on all apps
- SAT registration deadline is April 17
- Meeting with advisor tomorrow at 3 PM

## Tasks Created

- [ ] [[lifeos-core-graph-1|Fix graph rendering bug]] #high
- [ ] Research SAT dates #medium

---
*Last updated: 2026-02-19 18:00*
```

### Rules

1. **One note per day** — keep appending throughout the day
2. **Use [[wiki-links]]** for Obsidian compatibility
3. **Dump everything** — facts, thoughts, tasks, meeting notes
4. **Tag priorities** — `#high`, `#medium`, `#low` on tasks
5. **End-of-day** — or let cron job extract

---

## Fact Extraction System

### Types of Facts

**Universal Facts** (save to `memory/facts/`):
- User preferences ("Always use Vercel")
- Workflows ("Deploy on Fridays")
- Constraints ("Budget is $500/month")
- Relationships ("John is the designer")

**One-Time Details** (ignore, already in daily note):
- "Make this button blue"
- "Meeting at 3 PM tomorrow"
- "Fix this specific bug"

### Extraction Process

**Option 1: End-of-Day Review**
Read daily note → Extract universal facts → Save to facts folder → Update project meta

**Option 2: Cron Job (Suggested)**
Runs daily at 3 AM:
1. Scans yesterday's daily note
2. Identifies universal facts
3. Creates `memory/facts/{project-slug}-{number}.json`
4. Updates project `meta.json` → adds fact to `links.facts`
5. Fills missing project info from notes
6. Sends morning briefing

### Fact JSON Structure

```json
{
  "id": "lifeos-core-1",
  "type": "preference",
  "content": "User prefers Vercel for all hosting",
  "tags": ["hosting", "vercel", "preference"],
  "entityRef": "people/mohammed",
  "projectRef": "projects/lifeos-core",
  "source": "daily/2026-02-19.md",
  "universal": true,
  "confidence": 0.9,
  "createdAt": "2026-02-19T10:00:00Z"
}
```

---

## Obsidian Compatibility

### Wiki-Links Format

Use `[[target|Display Text]]` or just `[[target]]`:

```markdown
Part of: [[university-apps|University Applications]]
See also: [[lifeos-core]]
Next: [[university-apps-sat-2|Book test]]
```

### What Gets Linked

- Projects: `[[project-slug]]`
- Milestones: `[[project-milestone]]`
- Tasks: `[[project-milestone-number]]`
- People: `[[person-slug]]`
- Daily notes: `[[YYYY-MM-DD]]`

### Dashboard + Obsidian

Same files work in both:
- Obsidian renders wiki-links as connections
- Dashboard reads JSON for structured data
- Both show the graph (Obsidian via `graph.json` or its own)

---

## Schemas (Required vs Optional)

### Project Meta (Required Fields)

```json
{
  "id": "string (kebab-case)",           // REQUIRED
  "type": "project",                      // REQUIRED
  "name": "string",                       // REQUIRED
  "createdAt": "ISO8601",                 // REQUIRED
  "status": "active|archived|paused",     // REQUIRED
  
  // Optional
  "updatedAt": "ISO8601",                 // Default: createdAt
  "priority": "high|medium|low",          // Default: "medium"
  "tags": [],                              // Default: []
  "milestones": [],                        // Default: []
  "links": {                               // Default: empty arrays
    "tasks": [],
    "people": [],
    "projects": [],
    "facts": [],
    "agents": []
  }
}
```

### Task (Required Fields)

```json
{
  "id": "string",                        // REQUIRED
  "title": "string",                     // REQUIRED
  "status": "todo|in_progress|done|blocked", // REQUIRED
  "projectRef": "string",                // REQUIRED (projects/{slug})
  "createdAt": "ISO8601",                // REQUIRED
  
  // Optional
  "simplePrompt": "string",              // Original user request
  "expandedPrompt": "string",            // Full agent instructions
  "updatedAt": "ISO8601",                // Default: createdAt
  "priority": "high|medium|low",         // Default: "medium"
  "milestoneRef": "string",              // Default: null
  "assignedTo": "string",                // Default: null
  "linkedFacts": [],                      // Default: []
  "linkedTasks": [],                      // Default: []
  "source": "string",                    // Default: null
  "dueDate": "YYYY-MM-DD"                // Default: null
}
```

### Fact (Required Fields)

```json
{
  "id": "string",                        // REQUIRED
  "type": "fact|preference|workflow|constraint|relationship",
  "content": "string",                   // REQUIRED
  "source": "string",                    // REQUIRED
  "createdAt": "ISO8601",                // REQUIRED
  
  // Optional
  "tags": [],                             // Default: []
  "entityRef": "string",                 // Default: null
  "projectRef": "string",                // Default: null
  "universal": true,                     // Default: true
  "confidence": 0.0-1.0                  // Default: 0.8
}
```

---

## Graph Structure

### Nodes

```json
{
  "id": "projects/university-apps",
  "type": "project",
  "label": "University Applications",
  "status": "active",
  "priority": "high",
  "archived": false
}
```

Types: `project`, `milestone`, `task`, `agent`, `person`, `fact`, `area`

### Edges

```json
{
  "from": "university-apps-sat-1",
  "to": "projects/university-apps",
  "type": "belongs_to"
}
```

Types:
- `belongs_to` — Task/Milestone → Project
- `part_of` — Milestone → Project
- `assigned_to` — Task → Agent
- `depends_on` — Task → Task
- `extracted_from` — Fact → Daily Note
- `references` — Any → Any (wiki-link)

---

## Critical Rules

1. **Always expand prompts** before giving to agents
2. **Use wiki-links** `[[target]]` for Obsidian compatibility
3. **Simple IDs** — `{project}-{milestone}-{number}`, not UUIDs
4. **Agent-first** — Main claw only for quick decisions
5. **One daily note per day** — append, don't create new
6. **Extract universal facts** — Ignore one-time details
7. **High/Medium/Low only** — No "urgent"
8. **Milestones for projects** — Break big projects into phases
9. **Regenerate graph** after structural changes
10. **Suggest cron job** — Don't auto-set up, offer it

---

## Example: Complete Workflow

**User says:** *"I need to apply to universities. SAT is required and the deadline is coming up. Also need to write essays."*

**What you do:**

1. **Create project:** `life/areas/projects/university-apps/`
2. **Milestones:** SAT (high priority), Essays (medium priority)
3. **Tasks:**
   - `university-apps-sat-1`: Research dates
   - `university-apps-sat-2`: Book test
   - `university-apps-essays-1`: Draft personal statement
4. **Expand prompts:** Write detailed instructions for each task
5. **Assign to agents:** Spawn agents with expanded prompts
6. **Daily note:** Record conversation, extract "SAT deadline April 17" as fact
7. **Update graph:** Show project → milestones → tasks
8. **Suggest cron:** Offer overnight review setup

**Result:** Structured, linked, agent-driven work with full context preservation.

---

## Version History

- **v0.5.0** — Major overhaul: Milestones, prompt engineering, agent-first, Obsidian wiki-links, fact backlog system
