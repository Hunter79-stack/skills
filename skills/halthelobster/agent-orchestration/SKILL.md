---
name: agent-orchestration
version: 1.0.0
description: "Master the art of spawning and managing sub-agents. Write prompts that actually work, track running agents, and learn from every outcome. Part of the Hal Stack 🦞"
author: halthelobster
---

# Agent Orchestration 🦞

**By Hal Labs** — Part of the Hal Stack

Your agents fail because your prompts suck. This skill fixes that.

## The Problem

Most agent prompts are lazy task dumps:

```
❌ "Research the best vector databases and write a report"
```

This produces mediocre results. The agent doesn't know:
- What "best" means to you
- How deep to go
- When to stop
- What format you want
- What success looks like

**Then you spawn it and forget about it.** No tracking, no monitoring, no learning.

## The Solution: Engineered Orchestration

This skill gives you a complete system for sub-agent management:

1. **Prompt Engineering** — Write prompts that set agents up to succeed
2. **User Stories** — Define success from your perspective
3. **Ralph Mode** — Persistence until the job is done
4. **Active Tracking** — Never lose track of running agents
5. **Heartbeat Monitoring** — Check on agents during work
6. **Learnings Loop** — Get better at prompting over time

---

## Quick Start

1. Before spawning, write user stories first
2. Apply the prompt engineering checklist
3. Add to `active-agents.md` immediately
4. Check status during heartbeats
5. Log outcome to `LEARNINGS.md`

---

## The Seven Patterns

### 1. Prompt Engineering — The Foundation

**The rule:** Never spawn a lazy task dump. Take 2 minutes to engineer the prompt.

A well-engineered prompt = 10x better agent output. Lazy prompts = wasted tokens and mediocre results.

**The Checklist (use every time):**

```markdown
Before spawning ANY sub-agent:
- [ ] Clear persona/identity assigned?
- [ ] Structured with ### headers?
- [ ] "Think step by step" for complex tasks?
- [ ] Explicit success criteria (checkboxes)?
- [ ] Error handling instructions?
- [ ] Output format specified?
- [ ] Scope constraints (time/complexity limits)?
```

**Prompt Structure Template:**

```markdown
## Identity
You are a [role] agent specializing in [domain].

## Mission
[Clear, specific goal]

## Context
[Background the agent needs to understand the task]

## Approach
1. [Step 1]
2. [Step 2]
3. [Step 3]

## Success Criteria
- [ ] [Criterion 1]
- [ ] [Criterion 2]
- [ ] [Criterion 3]

## Output Format
[Exactly how to structure the response]

## Constraints
- Time budget: [limit]
- Scope: [boundaries]
- What NOT to do: [explicit exclusions]

## Error Handling
- If [situation]: [action]
- If blocked: [escalation path]
```

**Key principles:**
- 2-5 few-shot examples > lengthy instructions
- "Think step by step" dramatically improves reasoning tasks
- Describe what failure looks like to help avoid it
- Explicit constraints prevent scope creep

### 2. User Stories as Acceptance Criteria

**The insight:** Agents build what you describe, not what you want. User stories bridge that gap.

Before writing ANY prompt, define success from your perspective:

```markdown
## User Stories
1. As [you], I want [goal], so that [benefit]
2. As [you], I want [goal], so that [benefit]
3. As [you], I want [goal], so that [benefit]
```

**Real Example (dashboard build):**

```markdown
## User Stories
1. As Jordan, I want to see my active agents at a glance, so I don't lose track of running work
2. As Jordan, I want activity timestamps, so I know if something stalled
3. As Jordan, I want one-click refresh, so I can check status without commands
4. As Jordan, I want it to work offline, so it doesn't depend on external services
5. As Jordan, I want clean visual design, so it's pleasant to use daily
```

**Then add the acceptance loop to the prompt:**

```markdown
## Before Reporting Done
1. Review each user story from the task
2. Test: Does the build actually satisfy this story?
3. If NO → iterate and fix until it does
4. Only report "done" when ALL user stories pass

Do NOT declare success until user stories are verified.
```

**Why this works:** The agent has explicit criteria to build against and verify against. No ambiguity about what "done" means.

### 3. Active Agents Tracking

**The rule:** Every spawned agent gets tracked until completion. No orphans.

Maintain `notes/areas/active-agents.md`:

```markdown
# Active Agents

## Currently Running

| Label | Task | Spawned | Expected | Status |
|-------|------|---------|----------|--------|
| research-competitor-x | Deep dive on X's pricing | Jan 30 9:00 AM | 15m | 🏃 Running |
| builder-dashboard-v2 | Add charts to dashboard | Jan 30 9:15 AM | 30m | 🏃 Running |

## Completed Today

| Label | Task | Runtime | Result |
|-------|------|---------|--------|
| research-api-options | Compare API providers | 8m | ✅ Report in notes/research/ |
| review-pr-123 | Code review PR #123 | 3m | ✅ Approved with comments |

## Process

**On spawn:**
1. Add row to "Currently Running"
2. Note expected duration

**During heartbeats:**
1. Run `sessions_list --activeMinutes 120`
2. Check if agents still running
3. If completed/missing: investigate, move to Completed

**On completion:**
1. Review output
2. Log what worked/didn't in LEARNINGS.md
3. Move to Completed table
```

### 4. The Prompt Engineering Checklist (Deep Dive)

**Before spawning, verify:**

| Check | Why It Matters |
|-------|----------------|
| **Persona assigned** | Focuses the agent's knowledge and tone |
| **Structured headers** | Agents follow structured prompts better |
| **Step-by-step** | Improves reasoning quality 20-40% |
| **Success criteria** | Agent knows when it's actually done |
| **Error handling** | Agent recovers instead of failing |
| **Output format** | You get usable results, not walls of text |
| **Scope limits** | Prevents endless rabbit holes |

**Common Failures:**

| Anti-Pattern | Fix |
|--------------|-----|
| "Research X" | "Research X, focusing on [aspects], budget 10 searches, output as [format]" |
| "Build a thing" | Define user stories first, then specify acceptance criteria |
| "Fix this" | Describe expected behavior, provide test cases |
| No persona | "You are a senior [role] specializing in [domain]" |
| No format | "Output as: Summary (3 sentences), Key Findings (bullets), Recommendations (numbered)" |

### 5. Ralph Mode — Persistence Until Success

**Named after:** The relentless determination to keep trying until it works.

For complex tasks where first attempts often fail, add Ralph Mode:

```markdown
## Mode: Ralph
Keep trying until it works. Don't give up on first failure.

If something breaks:
1. Debug and understand why
2. Try a different approach
3. Research how others solved similar problems
4. Iterate until user stories are satisfied

You have [N] attempts before escalating. Use them.
```

**When to use Ralph Mode:**
- Build tasks with multiple components
- Integration work (APIs, services)
- Anything where "first try success" is unlikely
- Research that might hit dead ends

**Real example result:**
> dashboard-builder-v3 with Ralph Mode: All 5 user stories verified ✅
> Runtime: 4m39s
> Previous attempts without Ralph Mode: incomplete, didn't verify

### 6. Heartbeat Monitoring

**Don't spawn and forget.** Check on running agents during heartbeats.

**Add to your heartbeat routine:**

```markdown
## Agent Check
1. Run `sessions_list --activeMinutes 120 --limit 10`
2. For each running agent:
   - Still active? → Good, continue
   - Completed? → Review output, log learnings, update tracking
   - Timed out? → Investigate why, consider re-spawning
   - Failed? → Debug, fix prompt, re-spawn
3. Report significant status changes to human
```

**What to look for:**
- Agents running longer than expected
- Agents that completed but didn't report back
- Agents that failed silently
- Duplicate agents doing same work

### 7. The Learnings Loop

**Every agent outcome is data.** Capture it.

Maintain `notes/resources/prompt-library/LEARNINGS.md`:

```markdown
# Prompt Engineering Learnings

## What Works

1. **User stories + acceptance loop** — Agent verifies before reporting done
2. **Ralph mode for complex builds** — Persistence beats single-shot
3. **Explicit output format** — Gets usable results
4. **"Think step by step"** — Still remarkably effective

## What Doesn't Work

1. **Lazy task dumps** — "Do X" without context fails
2. **No success criteria** — Agent doesn't know when done
3. **Missing scope limits** — Agent researches forever
4. **Negative instructions** — "Don't be vague" doesn't help

## Experiment Log

### [Date]: [Agent Label]
**Prompt approach:** [What you tried]
**Outcome:** [What happened]
**Lesson:** [What you learned]
**Template updated:** [Yes/No, which one]
```

**After every agent completes:**
1. Did it achieve the user stories?
2. What worked well in the prompt?
3. What could be improved?
4. Update templates with learnings

---

## Complete Workflow

### Spawning a Sub-Agent

```
1. STOP — Don't just dump the task
2. Write user stories — What does success look like?
3. Check templates — Is there a template for this type of task?
4. Apply checklist — Persona? Structure? Criteria? Format?
5. Add Ralph mode — If complex or likely to need iteration
6. Spawn — With well-engineered prompt
7. Track — Add to active-agents.md immediately
8. Monitor — Check during heartbeats
9. Review — When complete, assess against user stories
10. Learn — Log to LEARNINGS.md, update templates
```

### Example: Spawning a Research Agent

**Bad (lazy):**
```
Research the best project management tools for small teams
```

**Good (engineered):**
```markdown
## Identity
You are a Research Agent specializing in SaaS tool evaluation.

## Mission
Evaluate project management tools for a 5-person remote software team.

## User Stories
1. As Jordan, I want a comparison table, so I can quickly see differences
2. As Jordan, I want pricing info, so I can budget
3. As Jordan, I want pros/cons for each, so I can make an informed decision
4. As Jordan, I want a recommendation, so I have a starting point

## Approach
1. Identify top 5 tools in this category
2. For each: features, pricing, pros, cons
3. Create comparison table
4. Make recommendation with reasoning

## Output Format
### Summary (3 sentences)
### Comparison Table
| Tool | Price | Best For | Limitations |
### Top 3 Deep Dives
### Recommendation

## Constraints
- Time budget: 10 web searches
- Focus: Tools under $20/user/month
- Skip: Enterprise-only solutions

## Before Reporting Done
Verify each user story is satisfied. If not, iterate.
```

---

## Templates

Ready-to-use templates in `templates/`:

| Template | Use For |
|----------|---------|
| `research-agent.md` | Information gathering, comparisons, deep dives |
| `builder-agent.md` | Creating files, code, scripts, documents |
| `review-agent.md` | Code review, document review, quality checks |

---

## Integration with Hal Stack

Agent Orchestration works best with the other Hal Stack skills:

| Skill | Integration |
|-------|-------------|
| **Bulletproof Memory** | Agents inherit context from SESSION-STATE.md |
| **PARA Second Brain** | Store agent outputs in appropriate PARA folders |
| **Proactive Agent** | Spawn agents proactively during heartbeats |

**The complete stack:**
1. **Bulletproof Memory** — Never lose context
2. **PARA Second Brain** — Organize knowledge
3. **Proactive Agent** — Act without being asked
4. **Agent Orchestration** — Multiply yourself with sub-agents

---

## Anti-Patterns

| Don't | Do Instead |
|-------|------------|
| Spawn and forget | Track in active-agents.md |
| Lazy task dumps | Engineer the prompt |
| Skip user stories | Define success first |
| Ignore failures | Log learnings, improve templates |
| Assume success | Verify against criteria |
| One-shot complex tasks | Use Ralph mode |

---

## Metrics to Track

Over time, measure your orchestration quality:

- **Success rate:** % of agents that complete user stories
- **Iteration count:** How many attempts before success
- **Prompt efficiency:** Tokens spent vs. quality of output
- **Time to completion:** Actual vs. expected duration
- **Learnings captured:** New patterns discovered

---

## The Mindset

You're not just running tasks in parallel. You're building a **council of specialists** that extends your capabilities.

Each sub-agent should be set up for success:
- Clear identity and mission
- Explicit success criteria
- Appropriate autonomy with constraints
- Paths to handle errors
- Feedback loop for improvement

**The standard:** Every agent you spawn should produce output you'd be proud to show someone.

---

*Part of the Hal Stack 🦞*

*Pairs well with [Bulletproof Memory](https://clawdhub.com/halthelobster/bulletproof-memory) for context persistence, [PARA Second Brain](https://clawdhub.com/halthelobster/para-second-brain) for knowledge organization, and [Proactive Agent](https://clawdhub.com/halthelobster/proactive-agent) for autonomous behavior.*

---

**Got a skill idea you need built?** Email me: halthelobster@protonmail.com

---

*"Lazy prompts produce lazy results. Engineer your agents."*
