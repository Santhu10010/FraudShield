import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, AlertTriangle, ShieldCheck, ShieldAlert, Loader2 } from "lucide-react";
import { checkFraud, INDIAN_CITIES, type Transaction } from "@/lib/fraud-engine";
import GlassCard from "./GlassCard";

const BEHAVIOR_OPTIONS = [
  "Normal activity",
  "new device",
  "multiple failed attempts",
  "unusual hours",
  "rapid transactions",
  "location change",
  "otp sharing",
  "unknown upi id",
];

interface TransactionFormProps {
  onSubmit: (tx: Transaction) => void;
}

const statusConfig = {
  safe: {
    Icon: ShieldCheck,
    color: "text-[#2D4A36]",
    bg: "bg-[#EBF0EC] border-[#C8D6CB]",
    label: "Settlement Approved (Low Risk)",
  },
  suspicious: {
    Icon: AlertTriangle,
    color: "text-[#7A541E]",
    bg: "bg-[#F9F4EB] border-[#E8D9C0]",
    label: "Anomalous Velocity Flagged",
  },
  fraud: {
    Icon: ShieldAlert,
    color: "text-[#7A2E2E]",
    bg: "bg-[#F9EBEB] border-[#E8C0C0]",
    label: "Critical Risk Detected",
  },
} as const;

export default function TransactionForm({ onSubmit }: TransactionFormProps) {
  const [amount, setAmount] = useState("");
  const [location, setLocation] = useState("");
  const [behavior, setBehavior] = useState("");
  const [result, setResult] = useState<{ score: number; status: keyof typeof statusConfig } | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedAmount = Number(amount);
    if (!Number.isFinite(parsedAmount) || parsedAmount < 0 || !location) return;
    setLoading(true);
    setResult(null);
    setTimeout(() => {
      const time = new Date().toISOString();
      const res = checkFraud({ amount: parsedAmount, location, time, userBehavior: behavior });
      setResult(res);
      const tx: Transaction = {
        id: `TXN-${Date.now()}`,
        userId: `USR-${Math.floor(Math.random() * 100) + 1}`,
        amount: parsedAmount,
        location,
        timestamp: time,
        fraudScore: res.score,
        isFraud: res.status === "fraud",
        status: res.status,
        featureAttribution: res.featureAttribution,
      };
      onSubmit(tx);
      setLoading(false);
    }, 600);
  };

  return (
    <GlassCard delay={0.1} hover={false} className="max-w-2xl mx-auto">
      <div className="border-b border-border pb-4 mb-6">
        <h2 className="text-xl font-editorial font-bold text-foreground tracking-tight">Manual Evaluation Intake</h2>
        <p className="text-xs text-muted-foreground font-mono mt-0.5">Submit payment parameters for automated heuristic scoring</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-mono font-medium text-foreground mb-1 block uppercase">Amount (₹ INR)</label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
              min="0"
              step="0.01"
              placeholder="e.g. 75000"
              className="w-full px-3.5 py-2.5 rounded bg-background border border-border text-foreground text-xs font-mono focus:outline-none focus:border-foreground transition-all"
            />
          </div>
          <div>
            <label className="text-xs font-mono font-medium text-foreground mb-1 block uppercase">Routing Location</label>
            <select
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              required
              className="w-full px-3.5 py-2.5 rounded bg-background border border-border text-foreground text-xs focus:outline-none focus:border-foreground transition-all"
            >
              <option value="">Select city / gateway</option>
              {INDIAN_CITIES.map((city) => (
                <option key={city} value={city}>{city}</option>
              ))}
              <option value="VPN">VPN / Proxy Gateway</option>
              <option value="Unknown">Unindexed Origin</option>
            </select>
          </div>
        </div>

        <div>
          <label className="text-xs font-mono font-medium text-foreground mb-1 block uppercase">Telemetry Indicator</label>
          <select
            value={behavior}
            onChange={(e) => setBehavior(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded bg-background border border-border text-foreground text-xs focus:outline-none focus:border-foreground transition-all"
          >
            <option value="">Select behavioral telemetry</option>
            {BEHAVIOR_OPTIONS.map((opt) => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
          </select>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-2.5 px-4 rounded bg-primary text-primary-foreground font-medium text-xs border border-border hover:bg-primary/90 transition-all cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2 shadow-[1px_1px_0px_rgba(0,0,0,0.05)]"
        >
          {loading ? (
            <>
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              <span>Evaluating Risk Models...</span>
            </>
          ) : (
            <>
              <Send className="w-3.5 h-3.5" />
              <span>Run Heuristic Risk Assessment</span>
            </>
          )}
        </button>
      </form>

      <AnimatePresence>
        {result && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="mt-6 pt-6 border-t border-border"
          >
            {(() => {
              const cfg = statusConfig[result.status];
              const Icon = cfg.Icon;
              return (
                <div className={`p-4 rounded border ${cfg.bg} flex items-center justify-between`}>
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded bg-white/60">
                      <Icon className={`w-5 h-5 ${cfg.color}`} />
                    </div>
                    <div>
                      <p className={`text-xs font-editorial font-bold ${cfg.color}`}>{cfg.label}</p>
                      <p className="text-[11px] text-muted-foreground font-mono mt-0.5">
                        Assigned Risk Quotient: {result.score}/100
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-xl font-bold font-mono text-foreground">{result.score}%</span>
                    <p className="text-[10px] font-mono text-muted-foreground uppercase">Score</p>
                  </div>
                </div>
              );
            })()}
          </motion.div>
        )}
      </AnimatePresence>
    </GlassCard>
  );
}
