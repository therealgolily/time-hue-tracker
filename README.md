# Personal OS — Hub Application

A unified personal and professional operating system built with React, TypeScript, Tailwind CSS, and Vite. All apps live under one authenticated shell with a shared design system and Lovable Cloud backend.

---

## What It Does

After logging in, the home screen routes you into one of two categories — **Personal** or **Work** — each with its own suite of purpose-built apps.

---

## App Directory

### 🏠 Personal

| App | Route | Description |
|---|---|---|
| **Time Tracking** | `/personal-time-tracker` | Daily energy-aware time tracker. Log work sessions with energy levels, categories, and client tags. Includes a live mode, timeline view, and weekly stats. |
| **Finance** | `/personal-finance` | Personal debt payoff calculator and financial planner. Tracks credit cards, budgets, assets, and runs amortization projections with event-based scenarios and net worth charts. |
| **Journal** | `/journal` | Daily reflection tool (Refresh). Guided prompts for morning priorities and evening accomplishments. Stores reflections per day with motivational quote rotation. |
| **Timeline** | `/timeline` | Life events timeline. Add and visualize meaningful milestones on a chronological canvas. |

---

### 💼 Work

| App | Route | Description |
|---|---|---|
| **Time Tracking** | `/work-time-tracker` | Client-facing work time tracker. Clock in/out per client, log multi-client time blocks, view weekly breakdowns by client, and export time allocation data. Supports live mode and a full timeline view. |
| **Finance** | `/business-finance` | S-Corp financial dashboard. Manages clients, retainers, payments, expenses (with CSV import), employees, contractors, business travel, payroll tax collections, tax liability estimates, and a scenario playground for what-if analysis. |
| **Calendar** | `/calendar` | Year-at-a-glance calendar. Create and manage events by category, view countdowns to upcoming dates, and navigate a full year grid with a mini-month sidebar. |
| **Tasks** | `tasks.rosserresults.com` | External task manager (opens in new tab). |

---

## Architecture

```
src/
├── pages/              # Top-level route pages
├── apps/
│   ├── finance/        # Business Finance module (self-contained)
│   └── debt-calculator/ # Personal Finance module (self-contained)
├── components/         # Shared UI and tracker components
├── hooks/              # Shared React hooks
├── types/              # Shared TypeScript types
└── integrations/
    └── supabase/       # Auto-generated Lovable Cloud client & types
```

Each app under `src/apps/` is designed to be portable — it can be extracted and deployed as a standalone project.

---

## Authentication

The app uses a two-step auth flow:
1. **Email/password login** via Lovable Cloud Auth
2. **PIN screen** — an optional secondary lock screen for added security

All routes except `/auth` and `/pin` are protected.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | React 18 + Vite |
| Language | TypeScript |
| Styling | Tailwind CSS + shadcn/ui |
| Routing | React Router v6 |
| Data Fetching | TanStack React Query |
| Backend | Lovable Cloud (Supabase) |
| Charts | Recharts |
| Forms | React Hook Form + Zod |

---

## Local Development

```sh
# Clone and install
git clone <YOUR_GIT_URL>
cd <YOUR_PROJECT_NAME>
npm install

# Start dev server
npm run dev
```

---

## Deployment

Open [Lovable](https://lovable.dev) and click **Share → Publish** to deploy. Custom domains can be configured under **Project → Settings → Domains**.
