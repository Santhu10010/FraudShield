# FraudShield — UPI Fraud Detection Dashboard

A TanStack Start (React 19 + Vite 7) app with a Supabase-backed auth + transaction
ledger and an AI chatbot powered by the Lovable AI Gateway.

## Run locally

### 1. Prerequisites
- [Bun](https://bun.sh) ≥ 1.1 (recommended) **or** Node.js ≥ 20 with npm
- A Supabase project (the included `.env` already points to the hosted Lovable Cloud
  backend so you can run it as-is)

### 2. Install
```bash
bun install
# or
npm install
```

### 3. Environment
The `.env` file in the repo root is already populated with the publishable Supabase
keys for the bundled backend. You only need to edit it if you want to point the app
at your own Supabase project:

```env
VITE_SUPABASE_URL="https://<your-project>.supabase.co"
VITE_SUPABASE_PUBLISHABLE_KEY="<your-anon-key>"
VITE_SUPABASE_PROJECT_ID="<your-project-ref>"
SUPABASE_URL="https://<your-project>.supabase.co"
SUPABASE_PUBLISHABLE_KEY="<your-anon-key>"
```

If you run your **own** Supabase project, also apply the SQL files in
`supabase/migrations/` (in order) via the Supabase SQL editor or CLI.

### 4. AI chatbot (optional)
The chatbot endpoint at `src/routes/api/chat.ts` calls the Lovable AI Gateway and
expects `LOVABLE_API_KEY` in the environment. When running outside Lovable, add it
to `.env`:

```env
LOVABLE_API_KEY="<your-lovable-ai-gateway-key>"
```

Without this key the rest of the app still works — only the chatbot will return an
error.

### 5. Start the dev server
```bash
bun run dev
# or
npm run dev
```

The app will be available at [http://localhost:5173](http://localhost:5173).

### 6. Production build
```bash
bun run build
bun run preview
```

## Project layout
- `src/routes/` — file-based routes (TanStack Router)
- `src/components/` — UI components (StatCard, TransactionForm, Chatbot, …)
- `src/lib/fraud-engine.ts` — heuristic fraud-scoring logic
- `src/integrations/supabase/` — Supabase client + generated types
- `supabase/migrations/` — database schema (auth profiles, transactions, RLS)

## Tech stack
React 19 · TanStack Start · Vite 7 · Tailwind CSS v4 · Supabase · Framer Motion ·
Chart.js · Lovable AI Gateway (Gemini)
