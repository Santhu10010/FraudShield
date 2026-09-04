# FraudShield

### Enterprise UPI transaction intelligence

FraudShield turns payment telemetry into a focused analyst workspace. Score a transaction, inspect the factors behind the decision, monitor live risk movement, and keep an auditable record of every reviewed event.

[![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)](https://www.typescriptlang.org/)
[![Supabase](https://img.shields.io/badge/Supabase-Postgres-3ecf8e?logo=supabase)](https://supabase.com/)
[![License](https://img.shields.io/badge/status-active-success)](https://github.com/Santhu10010/fraudshield)

> A responsive fraud monitoring dashboard with heuristic scoring, animated telemetry, role-aware access, and a persistent light/dark workspace theme.

## What you can do

| Workspace | Purpose |
| --- | --- |
| **Dashboard** | Scan transaction volume, risk distribution, and seven-day movement at a glance. |
| **Analyze** | Submit a payment payload and receive an immediate risk score with contributing factors. |
| **Ledger** | Review, filter, export, and track transactions stored in the audit journal. |
| **Security Copilot** | Ask for pattern analysis, highest-risk incidents, audit summaries, or mitigations. |

### Risk language

| Marker | Meaning |
| --- | --- |
| `SAFE` | Low-risk transaction cleared for settlement. |
| `SUSPICIOUS` | Anomalous activity requiring analyst review. |
| `FRAUD` | Critical-risk activity requiring containment. |

## Highlights

- **Heuristic risk engine** using amount, location, time, and behavior signals to produce a `0-100` score.
- **Explainable decisions** with factor attribution for amount spikes, location mismatch, velocity, and unusual hours.
- **Live-feeling telemetry** with generated transaction streams, animated alerts, and dashboard charts.
- **Role-aware access** for `ADMIN` and `ANALYST` users, backed by Supabase Auth and row-level security.
- **Theme switcher** in the navigation with a persisted light/dark preference and chart-aware contrast.
- **CSV exports** for selected transaction rows and filtered ledger entries.

## Stack

| Layer | Tools |
| --- | --- |
| Application | Next.js 16, React, TypeScript |
| UI | Tailwind CSS, Framer Motion, Lucide React |
| Data visualization | Chart.js, react-chartjs-2 |
| Backend | Supabase Auth, PostgreSQL, Row Level Security |
| Runtime | Bun or Node.js 20+ |

## Run locally

### Requirements

- [Bun](https://bun.sh) 1.1+ or Node.js 20+
- A Supabase project for hosted authentication and persistence, or use offline demo mode

### Install and start

```bash
git clone https://github.com/Santhu10010/fraudshield.git
cd fraudshield
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Configure Supabase

Create `.env.local` in the project root:

```env
NEXT_PUBLIC_SUPABASE_URL="https://<your-project-ref>.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="<your-anon-key>"
```

Apply the SQL files in `supabase/migrations/` in order using the Supabase SQL editor or CLI.

### Offline demo mode

When the Supabase URL is missing or still points to the placeholder backend, the dashboard uses local generated transactions and does not make database requests.

| Field | Demo value |
| --- | --- |
| Email | `demo@fraudshield.ai` |
| Password | `demo1234` |

## Quality checks

```bash
npm run lint
npx tsc --noEmit
```

## Repository map

```text
pages/                         Next.js routes and application shell
src/components/                Dashboard, charts, ledger, forms, and navigation
src/contexts/                  Authentication state and session handling
src/integrations/supabase/     Supabase clients and generated database types
src/lib/fraud-engine.ts        Fraud scoring and transaction generation
supabase/migrations/            Database schema, roles, and row-level security
```

## Project status

FraudShield is an active prototype focused on analyst workflows and explainable transaction scoring. Hosted persistence requires valid Supabase credentials; the local demo path is available for UI evaluation without a backend.
