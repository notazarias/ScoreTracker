# Score Tracker

A live basketball stat-tracking app for coaches and stat-keepers. Manage a roster, run live game tracking quarter-by-quarter, and review aggregate season stats — all synced per-user to Firestore.

Live demo: https://score-tracker-three.vercel.app

## Features

- **Team management** — add, edit, and remove players (name, jersey number, position, height)
- **Live game tracking** — select starters for both teams, track substitutions on the floor, and log points (1/2/3-pt shots with automatic FG/3PT/FT attempt-and-make bookkeeping), rebounds, assists, steals, blocks, turnovers, and fouls per player per quarter
- **Game history** — review completed games in detail
- **Dashboard** — season-level stats: record, total points, top scorer, best rebounder, most assists, best FG%
- **Auth** — email/password login and signup via Firebase Auth

## Stack

- React + Vite
- Chakra UI
- Firebase (Auth, Firestore, Analytics)
- React Router

## Getting started

```bash
npm install
npm run dev
```

## Status

Actively in development. `GameTracker.jsx` currently holds most of the live-tracking logic and is due for a split into smaller components.
