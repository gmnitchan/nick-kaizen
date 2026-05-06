# nick-kaizen improvements

## Planned

### Night Brief Step 3 — Sprint columns are too cramped
- The "Add task" input boxes and task cards in the sprint allocation columns are way too small
- With 6 sprints side by side, each column gets squeezed to ~100px which is unusable
- Task text gets truncated/invisible once added — card is too narrow to show the text
- Options: make columns wider and allow horizontal scroll, stack in 2 rows of 3, or use a tab/accordion layout instead of showing all at once

## Completed

### Voice-to-text for Night Brief brain dump
- Mic button in the top-right corner of the brain dump textarea
- Uses Web Speech API (SpeechRecognition) — works in Chrome, Edge, Safari
- Continuous mode: keeps listening until you click again
- Appends transcribed text to existing brain dump content
- No external APIs, no cost, no network needed
- Falls back gracefully (button hidden if browser doesn't support it)

### Better data persistence across daily cycles
- Unfinished tasks from previous briefs now appear in a yellow "carryover" section at the top of Night Brief
- Grouped by sprint so you can see what's lingering where
- "Carry" button adds a task to tomorrow's brief, keeping all its existing data (time spent, estimates)
- "Carry all forward" button to bulk-add everything
- "Drop" button to permanently delete tasks you no longer need
- Tasks already in tomorrow's brief are excluded from the carryover list (no duplicates)
- Only scans previous briefs' tasks — won't surface orphaned tasks
