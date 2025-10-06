# PocketFlow Tickets

This directory contains PocketFlow tickets for TrainU development tasks.

## Ticket Format

Each ticket is a YAML file with the following structure:

```yaml
id: PF-###-slug
title: Short descriptive title
type: bug | feature | task
priority: P0 | P1 | P2 | P3
status: open | in_progress | blocked | completed
created: YYYY-MM-DD
assignee: null | developer-name

description: |
  Detailed description of the issue or task

reproduction_steps:
  - Step 1
  - Step 2
  - Step 3

suspected_cause: |
  Analysis of what might be causing the issue

proposed_fix: |
  Suggested approach to fix the issue

acceptance_criteria:
  - Criterion 1
  - Criterion 2

files_affected:
  - path/to/file1.tsx
  - path/to/file2.ts

screenshots:
  - tmp/screenshots/path.png

related_tickets:
  - PF-###-other-ticket
```

## Ticket Categories

- **PF-404-\*** - Missing routes (404 errors)
- **PF-NAV-\*** - Navigation issues
- **PF-LINKS-\*** - Broken or incorrect links
- **PF-AUTH-\*** - Authentication/authorization issues
- **PF-UI-\*** - UI/UX improvements
- **PF-PERF-\*** - Performance issues
- **PF-A11Y-\*** - Accessibility improvements

## Workflow

1. Tickets are created by the route crawler or manually
2. Review and prioritize tickets
3. Assign to developers
4. Move status: open → in_progress → completed
5. Archive completed tickets to `_archive/` with completion date

## Current Status

**Phase 1 Complete! 🎉**  
All 11 Phase 1 tickets completed on October 6, 2025.

- ✅ Navigation system fully functional
- ✅ All critical bugs fixed
- ✅ Complete route coverage (no 404s)
- ✅ Error boundaries in place
- ✅ Trainer directory seeded

See `_archive/COMPLETION_SUMMARY.md` for details.

**Active Tickets:** 0  
**Completed & Archived:** 11

