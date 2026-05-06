# nick-kaizen

A personal daily operating system built for Nick. Designed to make opening the laptop and starting work low-friction and rewarding.

**Live:** https://gmnitchan.github.io/nick-kaizen/

## What this is

A single-user web app with three modes that form a daily cycle:

1. **Night Brief** (every evening) — Dump everything in your head, pick ONE highlight for tomorrow, sort tasks into sprints, lock it in, close the laptop.
2. **Morning Launch** (when you open the laptop) — See your highlight front and center, check off morning rituals, pick a sprint to start.
3. **Sprint Board** (during work) — Work one sprint at a time with a running timer. Start/done/skip tasks. Switch sprints when ready.

The app auto-selects the right mode based on time of day, but you can always switch manually via the dropdown in the top-right corner.

## Sprints

Work is organized into sprint categories. The current defaults are:

- **Soberin Revenue** — Vibe coding, software services, immediate $
- **Chief Challengers** — Everything to build the product
- **Personal Brand** — Content creation, set up meetings, hustle
- **Elite Admit** — Complete Gut's application
- **Chula Class** — Chulalongkorn University coursework and classes
- **Admin** — Emails, follow-ups, paperwork, the avoided stuff

Sprints are fully configurable from **Sprint Settings** in the dropdown. You can add, edit, archive, and restore sprints at any time. Archived sprints preserve all their task and time data in Stats but don't appear in the daily workflow.

## Features

- **Voice-to-text brain dump** — Click the mic button to speak instead of type (uses browser's Web Speech API, works in Chrome/Edge/Safari)
- **Task carryover** — Unfinished tasks from previous days appear at the top of Night Brief so you can carry them forward or drop them
- **Sprint timer** — Tracks total time per sprint session, and per-task time when you hit "Start" on a task
- **Morning rituals** — Quick checkboxes for gym, sunlight, shower, ate
- **Brief streak** — Counts consecutive days you filed a Night Brief
- **Stats view** — 14-day laptop open time dots, estimated vs actual time per sprint, highlight completion rate, most avoided sprint
- **Export/Import** — Download your full app state as JSON, restore from backup
- **Data archive on reset** — Resetting the app archives your data instead of deleting it, with restore/download/delete options
- **Welcome guide** — Onboarding screen for first-time users, accessible anytime from the dropdown

## Data storage

All data lives in your browser's localStorage. There is no backend, no cloud sync, no accounts, no external requests. Data persists across tab closes and browser restarts. It only gets wiped if you clear browser data, use incognito mode, or switch to a different browser.

## Stack

- React + TypeScript + Vite
- Tailwind CSS v4
- localStorage for persistence
- GitHub Pages for hosting
- No backend, no auth, no external dependencies beyond React and Tailwind

## Run locally

```
git clone https://github.com/gmnitchan/nick-kaizen.git
cd nick-kaizen
npm install
npm run dev
```

Open http://localhost:5173/nick-kaizen/

## Deploy

Push to `main` and GitHub Actions auto-deploys to GitHub Pages. The workflow is in `.github/workflows/deploy.yml`.

To set up on a new repo:
1. Push to GitHub
2. Go to Settings > Pages
3. Set Source to "GitHub Actions"
4. The next push to `main` will deploy

## File structure

```
src/
  App.tsx                  — Mode router, top-level layout
  main.tsx                 — Entry point
  index.css                — Tailwind directives and theme
  state/
    types.ts               — All TypeScript types (Sprint, Task, Brief, etc.)
    store.ts               — localStorage-backed state with actions
  modes/
    NightBrief.tsx          — Evening planning flow
    MorningLaunch.tsx       — Morning highlight + sprint picker
    SprintBoard.tsx         — Active sprint with timer and task list
  components/
    BrainDump.tsx           — Textarea with voice-to-text
    HighlightInput.tsx      — Single highlight text input
    SprintColumn.tsx        — Task column for a sprint in Night Brief
    TaskRow.tsx             — Task with start/done/skip controls
    Timer.tsx               — Live mm:ss timer display
    StatsView.tsx           — Stats, export/import, reset, archives
    SprintSettings.tsx      — Add/edit/archive/restore sprints
    ModeSwitcher.tsx        — Dropdown to switch modes
    Welcome.tsx             — First-time onboarding screen
    HelpButton.tsx          — Quick reference modal
  lib/
    date.ts                 — Local-time date helpers
    timer.ts                — Elapsed time hook
    sprints.ts              — Default sprint definitions
```

## Tip

Set the deployed URL as your browser homepage so it loads automatically when you open the laptop. That's the whole point.
