import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Activity, ShieldAlert, ShieldCheck, TrendingUp, Settings2, Play, Square } from "lucide-react";
import { toast } from "sonner";
import { generateMockTransactions, type Transaction } from "@/lib/fraud-engine";
import { transactionStream } from "@/lib/transaction-stream";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
// Removed sounds import
import Navbar, { type DashboardPage } from "@/components/Navbar";
import StatCard from "@/components/StatCard";
import FraudChart from "@/components/FraudChart";
import TransactionTable from "@/components/TransactionTable";
import TransactionForm from "@/components/TransactionForm";
import TransactionLedger from "@/components/TransactionLedger";
import FraudAlert from "@/components/FraudAlert";
import RuleConfigurator from "@/components/RuleConfigurator";

export const Route = createFileRoute("/dashboard")({
  component: Dashboard,
});

function Dashboard() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [page, setPage] = useState<DashboardPage>("dashboard");
  const [transactions, setTransactions] = useState<Transaction[]>(() => generateMockTransactions(50));
  const [alertMsg, setAlertMsg] = useState<{msg: string, attr?: Record<string, number>} | null>(null);
  const [isStreamActive, setIsStreamActive] = useState(false);
  const [isConfigOpen, setIsConfigOpen] = useState(false);

  // Redirect to /login if not authenticated
  useEffect(() => {
    if (!loading && !user) void navigate({ to: "/login" });
  }, [user, loading, navigate]);

  const stats = useMemo(() => {
    const safe = transactions.filter((t) => t.status === "safe").length;
    const suspicious = transactions.filter((t) => t.status === "suspicious").length;
    const fraud = transactions.filter((t) => t.status === "fraud").length;
    return { total: transactions.length, safe, suspicious, fraud };
  }, [transactions]);

  const dailyData = useMemo(() => {
    const days = 7;
    return Array.from({ length: days }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (days - 1 - i));
      const label = d.toLocaleDateString("en-IN", { month: "short", day: "numeric" });
      const dayTxs = transactions.filter((t) => new Date(t.timestamp).toDateString() === d.toDateString());
      return {
        date: label,
        fraud: dayTxs.filter((t) => t.status === "fraud").length,
        safe: dayTxs.filter((t) => t.status === "safe").length,
      };
    });
  }, [transactions]);

  const handleNewTransaction = useCallback(
    async (tx: Transaction) => {
      setTransactions((prev) => [tx, ...prev]);

      if (user) {
        const { error } = await supabase.from("transaction_ledger").insert({
          user_id: user.id,
          transaction_id: tx.id,
          amount: tx.amount,
          location: tx.location,
          user_behavior: "",
          fraud_score: tx.fraudScore,
          status: tx.status,
        });
        if (error) toast.error(`Could not save to ledger: ${error.message}`);
      }

      if (tx.status === "fraud") {
        setAlertMsg({
          msg: `Fraud detected on ${tx.id}: ₹${tx.amount.toLocaleString("en-IN")} from ${tx.location} (Score: ${tx.fraudScore}%)`,
          attr: tx.featureAttribution
        });
      }
    },
    [user, navigate],
  );

  useEffect(() => {
    if (isStreamActive) {
      transactionStream.start();
      const unsubscribe = transactionStream.subscribe(handleNewTransaction);
      return () => {
        unsubscribe();
        transactionStream.stop();
      };
    } else {
      transactionStream.stop();
    }
  }, [isStreamActive, handleNewTransaction]);

  if (loading || !user) {
    return (
      <div className="min-h-screen gradient-bg flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-10 h-10 border-2 border-primary/30 border-t-primary rounded-full"
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen gradient-bg">
      <Navbar currentPage={page} onNavigate={setPage} />
      <FraudAlert message={alertMsg?.msg || null} featureAttribution={alertMsg?.attr} onClose={() => setAlertMsg(null)} />
      <RuleConfigurator isOpen={isConfigOpen} onClose={() => setIsConfigOpen(false)} />

      <main className="max-w-7xl mx-auto px-6 py-8">
        <AnimatePresence mode="wait">
          {page === "dashboard" ? (
            <motion.div
              key="dashboard"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3 }}
              className="space-y-8"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-3xl font-display font-bold text-gradient mb-2">Dashboard</h2>
                  <p className="text-muted-foreground">Real-time fraud monitoring across India</p>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setIsStreamActive(!isStreamActive)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-md font-mono text-xs font-bold transition-all ${
                      isStreamActive 
                        ? "bg-[#2D4A36] text-[#EBF0EC] border border-[#2D4A36]" 
                        : "bg-muted text-foreground border border-border hover:bg-muted/80"
                    }`}
                  >
                    {isStreamActive ? <Square size={14} className="animate-pulse" /> : <Play size={14} />}
                    {isStreamActive ? "STREAM ACTIVE" : "START STREAM"}
                  </button>
                  
                  {user?.role === "ADMIN" && (
                    <button
                      onClick={() => setIsConfigOpen(true)}
                      className="p-2 border border-border bg-card hover:bg-muted text-foreground rounded-md transition-colors"
                      title="Rule Settings"
                    >
                      <Settings2 size={16} />
                    </button>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard title="Total Transactions" value={stats.total} icon={Activity} variant="blue" delay={0.1} trend="+12% this week" />
                <StatCard
                  title="Safe"
                  value={stats.safe}
                  icon={ShieldCheck}
                  variant="cyan"
                  delay={0.2}
                  trend={`${stats.total ? ((stats.safe / stats.total) * 100).toFixed(1) : 0}% of total`}
                />
                <StatCard title="Suspicious" value={stats.suspicious} icon={TrendingUp} variant="purple" delay={0.3} trend="Needs review" />
                <StatCard
                  title="Fraud Detected"
                  value={stats.fraud}
                  icon={ShieldAlert}
                  variant="danger"
                  delay={0.4}
                  trend={`${stats.total ? ((stats.fraud / stats.total) * 100).toFixed(1) : 0}% rate`}
                />
              </div>

              <FraudChart safeCount={stats.safe} suspiciousCount={stats.suspicious} fraudCount={stats.fraud} dailyData={dailyData} />
              <TransactionTable transactions={transactions} />
            </motion.div>
          ) : page === "analyze" ? (
            <motion.div
              key="analyze"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="space-y-8"
            >
              <div>
                <h2 className="text-3xl font-display font-bold text-gradient mb-2">Analyze Transaction</h2>
                <p className="text-muted-foreground">Submit a transaction for fraud analysis</p>
              </div>
              <TransactionForm onSubmit={handleNewTransaction} />
              <TransactionTable transactions={transactions} />
            </motion.div>
          ) : (
            <TransactionLedger />
          )}
        </AnimatePresence>
      </main>
      {/* <Chatbot /> removed for professional UI */}
    </div>
  );
}

export default Dashboard;
