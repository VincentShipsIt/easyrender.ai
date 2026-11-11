---

name: project-board
description: How the easyrender.ai GitHub board and issues are run (mirrors genfeedai/genfeed.ai Project #12)
type: reference
---

The board is [Project #1](https://github.com/orgs/easyrenderai/projects/1). It copies how
genfeedai/genfeed.ai runs Project #12. Source of truth for delivery state is GitHub, never a local
file.

**Status** (project field, in order): Backlog (accepted, scheduled), In Progress (actively worked),
Human Review (waiting on the owner or a production acceptance check), Done (merged, verification
recorded), Deferred (blocked or intentionally unscheduled).

**Native org Issue Fields** (shown on the board, never duplicated as labels or project fields):
Priority P0 to P3 (P0 is urgent), Complexity, Area, Surface, Blast radius, Release track, Start
date, Target date. **Issue types**: Bug, Feature, Task, set by the issue form.

**Labels** are for discovery and triage only: `needs:triage` (applied by every form, removed after
triage within 7 days), `needs:ears` (rewrite acceptance criteria), `needs:info`, `good first issue`,
`help wanted`, `epic`, `security`, `human-review`, `deferred`.

**Views**: Kanban Board (grouped by Status, P0 first) and Roadmap.

**Current top priorities** (both P0, plugins first): epic #70 store plugins (catalogue to 3D, QR
code, AR on the phone) and epic #71 pro render pipeline for interior designers and agencies.

**Why:** Vincent wants the same status columns, issue template and way of working as genfeed.ai,
and the two revenue epics at the top of the board.
**How to apply:**

- Search open PRs and issues before starting: whoever opened the PR first owns the work.
- Set Priority when an item joins the board. An empty Priority is a board defect.
- Move the parent epic to In Progress as soon as any child starts or ships.
- Use `Closes #n` only for the issue the PR completes. Use `Refs #n` while acceptance is open.
- Issue body is the PRD: no YAML frontmatter, short title (4 to 7 words, verb plus object), EARS
  acceptance criteria, an Out of scope list.
- Human Review is for owner decisions or production acceptance after merge (for example a real
  paid render or a real-phone AR check), not for code review.
