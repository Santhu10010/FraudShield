import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { BookOpen, Download, Filter, IndianRupee, ShieldAlert, ShieldCheck, AlertTriangle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import GlassCard from "./GlassCard";

interface LedgerEntry {
  id: string;
  transaction_id: string;
  amount: number;
  location: string;
  user_behavior: string | null;
  fraud_score: number;
  status: "safe" | "suspicious" | "fraud";
  analyzed_at: string;
}

const statusConfig = {
  safe: {
    Icon: ShieldCheck,
    color: "text-[#2D4A36]",
    bg: "bg-[#EBF0EC]",
    badge: "bg-[#EBF0EC] text-[#2D4A36] border-[#C8D6CB]",
  },
  suspicious: {
    Icon: AlertTriangle,
    color: "text-[#7A541E]",
    bg: "bg-[#F9F4EB]",
    badge: "bg-[#F9F4EB] text-[#7A541E] border-[#E8D9C0]",
  },
  fraud: {
    Icon: ShieldAlert,
    color: "text-[#7A2E2E]",
    bg: "bg-[#F9EBEB]",
    badge: "bg-[#F9EBEB] text-[#7A2E2E] border-[#E8C0C0]",
  },
} as const;

export default function TransactionLedger() {
  const { user } = useAuth();
  const [entries, setEntries] = useState<LedgerEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "safe" | "suspicious" | "fraud">("all");

  useEffect(() => {
    if (!user) return;
    let mounted = true;

    (async () => {
      setLoading(true);
      const { data } = await supabase
        .from("transaction_ledger")
        .select("*")
        .order("analyzed_at", { ascending: false });
      if (mounted && data) setEntries(data as LedgerEntry[]);
      if (mounted) setLoading(false);
    })();

    const channel = supabase
      .channel("ledger-changes")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "transaction_ledger" },
        (payload) => setEntries((prev) => [payload.new as LedgerEntry, ...prev]),
      )
      .subscribe();

    return () => {
      mounted = false;
      void supabase.removeChannel(channel);
    };
  }, [user]);

  const filtered = filter === "all" ? entries : entries.filter((e) => e.status === filter);

  const totals = {
    total: entries.length,
    totalAmount: entries.reduce((s, e) => s + Number(e.amount), 0),
    safe: entries.filter((e) => e.status === "safe").length,
    fraud: entries.filter((e) => e.status === "fraud").length,
  };

  const exportCSV = () => {
    const headers = "Transaction ID,Amount (INR),Location,Behavior,Fraud Score,Status,Analyzed At\n";
    const rows = filtered
      .map((e) =>
        `${e.transaction_id},${e.amount},${e.location},${e.user_behavior || "N/A"},${e.fraud_score}%,${e.status},${new Date(e.analyzed_at).toLocaleString("en-IN")}`,
      )
      .join("\n");
    const blob = new Blob([headers + rows], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `fraud-ledger-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.2 }}
      className="space-y-6"
    >
      <div className="flex items-center justify-between gap-4 flex-wrap border-b border-border pb-4">
        <div>
          <h2 className="text-2xl font-editorial font-bold text-foreground tracking-tight">Archival Settlement Ledger</h2>
          <p className="text-xs text-muted-foreground font-mono mt-0.5">Permanent record of audited transactions across network nodes</p>
        </div>
        <button
          onClick={exportCSV}
          className="flex items-center gap-2 px-3.5 py-2 rounded bg-primary text-primary-foreground text-xs font-medium border border-border shadow-[1px_1px_0px_rgba(0,0,0,0.05)] hover:bg-primary/90 transition-all cursor-pointer"
        >
          <Download size={14} /> Export CSV Extract
        </button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <GlassCard delay={0.05} className="!p-4">
          <p className="text-[11px] font-mono text-muted-foreground uppercase">Total Ingested</p>
          <p className="text-xl font-mono font-bold text-foreground mt-1">{totals.total}</p>
        </GlassCard>
        <GlassCard delay={0.1} className="!p-4">
          <p className="text-[11px] font-mono text-muted-foreground uppercase">Monitored Capital</p>
          <p className="text-xl font-mono font-bold text-foreground mt-1 flex items-center gap-1">
            <IndianRupee size={15} />{totals.totalAmount.toLocaleString("en-IN")}
          </p>
        </GlassCard>
        <GlassCard delay={0.15} className="!p-4">
          <p className="text-[11px] font-mono text-muted-foreground uppercase">Clearance Ratio</p>
          <p className="text-xl font-mono font-bold text-[#2D4A36] mt-1">
            {totals.total > 0 ? ((totals.safe / totals.total) * 100).toFixed(1) : 0}%
          </p>
        </GlassCard>
        <GlassCard delay={0.2} className="!p-4">
          <p className="text-[11px] font-mono text-muted-foreground uppercase">Containment Ratio</p>
          <p className="text-xl font-mono font-bold text-[#7A2E2E] mt-1">
            {totals.total > 0 ? ((totals.fraud / totals.total) * 100).toFixed(1) : 0}%
          </p>
        </GlassCard>
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        <Filter size={14} className="text-muted-foreground" />
        {(["all", "safe", "suspicious", "fraud"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1 rounded text-xs font-mono transition-all border cursor-pointer ${
              filter === f
                ? "bg-primary text-primary-foreground border-primary shadow-[1px_1px_0px_rgba(0,0,0,0.05)]"
                : "bg-card text-muted-foreground border-border hover:text-foreground"
            }`}
          >
            {f.toUpperCase()} {f !== "all" && `(${entries.filter((e) => e.status === f).length})`}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="editorial-card p-4 animate-pulse">
              <div className="h-4 bg-muted rounded w-1/3 mb-2" />
              <div className="h-3 bg-muted rounded w-2/3" />
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <GlassCard hover={false} className="text-center py-12">
          <BookOpen size={40} className="mx-auto text-muted-foreground mb-3" />
          <p className="text-base font-editorial font-bold text-foreground">Archive is currently empty</p>
          <p className="text-xs text-muted-foreground font-mono mt-1">
            {entries.length === 0
              ? "Submit transaction payloads to build the permanent audit ledger"
              : "No ledger entries match the active criteria"}
          </p>
        </GlassCard>
      ) : (
        <div className="space-y-2">
          {filtered.map((entry, i) => {
            const cfg = statusConfig[entry.status];
            const Icon = cfg.Icon;
            return (
              <motion.div
                key={entry.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: i * 0.02, duration: 0.2 }}
                className="editorial-card p-3.5 hover:border-foreground/40 transition-colors"
              >
                <div className="flex items-center gap-3.5 flex-wrap">
                  <div className={`p-2 rounded ${cfg.bg} flex-shrink-0 border border-border`}>
                    <Icon size={16} className={cfg.color} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                      <span className="font-mono text-xs font-bold text-foreground">{entry.transaction_id}</span>
                      <span className={`px-2 py-0.5 text-[10px] font-mono font-medium rounded border ${cfg.badge}`}>
                        {entry.status.toUpperCase()}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {entry.location} · {new Date(entry.analyzed_at).toLocaleString("en-IN", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-mono font-bold text-xs text-foreground">₹{Number(entry.amount).toLocaleString("en-IN")}</p>
                    <p className="text-[11px] text-muted-foreground font-mono">Risk: {entry.fraud_score}%</p>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </motion.div>
  );
}
