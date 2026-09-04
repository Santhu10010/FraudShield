# FraudShield — Enterprise UPI Transaction Fraud Detection System

FraudShield is an enterprise-grade real-time transaction monitoring and risk intelligence platform built with Next.js, TypeScript, and Supabase. The platform provides real-time fraud scoring, automated anomaly detection, SHAP-style feature attribution, role-based access control (RBAC), and an administrative audit ledger.

---

## Key Capabilities

* **Hybrid Fraud Scoring Engine:** Combines deterministic, rule-based heuristics (high-velocity, location anomalies, threshold limits) with predictive ML classification to calculate real-time transaction risk scores ($0\text{--}100$).
* **SHAP Feature Attribution:** Exposes granular SHAP (SHapley Additive exPlanations) risk breakdowns for flagged transactions to provide immediate context on feature weights (e.g., location mismatch vs. amount spike).
* **Simulated Real-Time Streaming:** Client-side transaction ingestion with animated ledger updates and instant risk alerts.
* **Security & Audit Hardening:** Role-based access control (`ADMIN` vs `ANALYST`) and a Supabase-backed transaction ledger with row-level security.
* **Theme Controls:** Persistent light/dark theme switch in the dashboard navigation. Chart labels and legends adapt to the selected theme.
* **Clear Status Signals:** Safe, suspicious, and fraud records use consistent green, yellow, and red markers in dashboard status surfaces.
* **Refined Editorial UI/UX:** Dense, responsive dashboard design with readable typography and focused transaction workflows.

---

## Tech Stack

* **Frontend Framework:** Next.js 16, React, TypeScript
* **Build System:** Next.js with Turbopack in development
* **Styling & Icons:** Tailwind CSS, Lucide React
* **Backend & Database:** Supabase (PostgreSQL, Row Level Security, Auth Middleware)
* **Runtime & Package Manager:** Bun / Node.js

---

## Local Development Setup

### 1. Prerequisites
* [Bun](https://bun.sh) ≥ 1.1 (recommended) or Node.js ≥ 20
* Supabase project for hosted authentication and persistence (optional for offline demo mode)

### 2. Installation
```bash
# Clone the repository
git clone [https://github.com/Santhu10010/fraudshield.git](https://github.com/Santhu10010/fraudshield.git)
cd fraudshield

# Install dependencies
bun install
# or
npm install

# Create .env.local with your Supabase project values
NEXT_PUBLIC_SUPABASE_URL="https://<your-project-ref>.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="<your-anon-key>"

bun run dev
# or
npm run dev
```

The app will be available at `http://localhost:3000`.

If you run your own Supabase project, apply the SQL files in
`supabase/migrations/` in order using the Supabase SQL editor or CLI.

When the URL is not configured or still points to the repository's placeholder
value, the app runs in offline demo mode. Use `demo@fraudshield.ai` with
`demo1234` to enter the dashboard. Transactions are generated locally and are
not persisted to a remote database in this mode.

### Available checks

```bash
npm run lint
npx tsc --noEmit
```

## Project layout
- `pages/` — Next.js pages
- `src/components/` — UI components (StatCard, TransactionForm, ledger, …)
- `src/lib/fraud-engine.ts` — heuristic fraud-scoring logic
- `src/integrations/supabase/` — Supabase client + generated types
- `supabase/migrations/` — database schema (auth profiles, transactions, RLS)
