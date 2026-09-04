# FraudShield — Enterprise UPI Transaction Fraud Detection System

FraudShield is an enterprise-grade real-time transaction monitoring and risk intelligence platform built with Next.js, TypeScript, and Supabase. The platform provides real-time fraud scoring, automated anomaly detection, SHAP model explainability, role-based access control (RBAC), and an administrative audit ledger.

---

## Key Capabilities

* **Hybrid Fraud Scoring Engine:** Combines deterministic, rule-based heuristics (high-velocity, location anomalies, threshold limits) with predictive ML classification to calculate real-time transaction risk scores ($0\text{--}100$).
* **SHAP Feature Attribution:** Exposes granular SHAP (SHapley Additive exPlanations) risk breakdowns for flagged transactions to provide immediate context on feature weights (e.g., location mismatch vs. amount spike).
* **Simulated Real-Time Streaming:** Client-side WebSocket/SSE transaction ingestion pipeline with low-latency status resolution, animated ledger updating, and instant risk alerts.
* **Security & Audit Hardening:** Strict role-based access control (`ADMIN` vs `ANALYST` access) backed by JWT authentication, DTO-driven API response layers, and an immutable administrative audit ledger logging status overrides and policy changes.
* **Refined Editorial UI/UX:** High-contrast, accessibility-focused editorial visual design with clean typography and subtle, high-contrast status indicators.

---

## Technical Architecture & Layout
---

## Tech Stack

* **Frontend Framework:** React 19, TypeScript, TanStack Router
* **Build System:** Vite 7
* **Styling & Icons:** Tailwind CSS, Lucide React
* **Backend & Database:** Supabase (PostgreSQL, Row Level Security, Auth Middleware)
* **Runtime & Package Manager:** Bun / Node.js

---

## Local Development Setup

### 1. Prerequisites
* [Bun](https://bun.sh) ≥ 1.1 (recommended) or Node.js ≥ 20
* Supabase Account & CLI (optional for local database migrations)

### 2. Installation
```bash
# Clone the repository
git clone [https://github.com/Santhu10010/fraudshield.git](https://github.com/Santhu10010/fraudshield.git)
cd fraudshield

# Install dependencies
bun install
# or
npm install
VITE_SUPABASE_URL="https://<your-project-ref>.supabase.co"
VITE_SUPABASE_PUBLISHABLE_KEY="<your-anon-key>"
VITE_SUPABASE_PROJECT_ID="<your-project-ref>"
SUPABASE_URL="https://<your-project-ref>.supabase.co"
SUPABASE_PUBLISHABLE_KEY="<your-anon-key>"
bun run dev
# or
npm run dev
```

The app will be available at `http://localhost:3000`.

If you run your own Supabase project, apply the SQL files in
`supabase/migrations/` in order using the Supabase SQL editor or CLI.

## Project layout
- `pages/` — Next.js pages
- `src/components/` — UI components (StatCard, TransactionForm, ledger, …)
- `src/lib/fraud-engine.ts` — heuristic fraud-scoring logic
- `src/integrations/supabase/` — Supabase client + generated types
- `supabase/migrations/` — database schema (auth profiles, transactions, RLS)
