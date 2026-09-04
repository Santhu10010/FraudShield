// pages/dashboard.tsx
import { useState, useMemo, useCallback, useEffect } from 'react';
import { useRouter } from 'next/router';
import Navbar, { type DashboardPage } from '@/components/Navbar';
import StatCard from '@/components/StatCard';
import FraudChart from '@/components/FraudChart';
import TransactionTable from '@/components/TransactionTable';
import TransactionForm from '@/components/TransactionForm';
import TransactionLedger from '@/components/TransactionLedger';
import FraudAlert from '@/components/FraudAlert';
import SecurityCopilot from '@/components/SecurityCopilot';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { generateMockTransactions, type Transaction } from '@/lib/fraud-engine';
import { supabase } from '@/integrations/supabase/client';
import { isSupabaseConfigured } from '@/integrations/supabase/client';
import { AnimatePresence, motion } from 'framer-motion';
import { Activity, ShieldAlert, ShieldCheck, TrendingUp } from 'lucide-react';

export default function Dashboard() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [page, setPage] = useState<DashboardPage>('dashboard');
  const [transactions, setTransactions] = useState<Transaction[]>(()=> generateMockTransactions(50));
  const [alertMsg, setAlertMsg] = useState<string | null>(null);

  // redirect if unauthenticated
  useEffect(() => {
    const isAuthed = !!user;
    if (!loading && !isAuthed) router.replace('/login');
  }, [user, loading, router]);

  const stats = useMemo(() => {
    const safe = transactions.filter(t=>t.status==='safe').length;
    const suspicious = transactions.filter(t=>t.status==='suspicious').length;
    const fraud = transactions.filter(t=>t.status==='fraud').length;
    return { total: transactions.length, safe, suspicious, fraud };
  }, [transactions]);

  const dailyData = useMemo(() => {
    const days = 7;
    return Array.from({length: days}, (_, i)=>{
      const d = new Date();
      d.setDate(d.getDate() - (days-1-i));
      const label = d.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' });
      const dayTxs = transactions.filter(t=> new Date(t.timestamp).toDateString()===d.toDateString());
      return { date: label, fraud: dayTxs.filter(t=>t.status==='fraud').length, safe: dayTxs.filter(t=>t.status==='safe').length };
    });
  }, [transactions]);

  const handleNewTransaction = useCallback(async (tx: Transaction)=>{
    setTransactions(prev=>[tx,...prev]);
    if (user && isSupabaseConfigured) {
      const { error } = await supabase.from('transaction_ledger').insert({
        user_id: user.id,
        transaction_id: tx.id,
        amount: tx.amount,
        location: tx.location,
        user_behavior: '',
        fraud_score: tx.fraudScore,
        status: tx.status,
      });
      if (error) toast.error(`Could not save to ledger: ${error.message}`);
    }
    if (tx.status==='fraud') {
      setAlertMsg(`Fraud detected on ${tx.id}: ₹${tx.amount.toLocaleString('en-IN')} from ${tx.location} (Score: ${tx.fraudScore}%)`);
    }
  }, [user]);

  const isAuthed = !!user;

  if (loading || !isAuthed) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }} className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar currentPage={page} onNavigate={setPage} />
      <FraudAlert message={alertMsg} onClose={()=> setAlertMsg(null)} />
      <main className="max-w-7xl mx-auto px-6 py-8">
        <AnimatePresence mode="wait">
          {page==='dashboard' ? (
            <motion.div key="dashboard" initial={{opacity:0, y:8}} animate={{opacity:1, y:0}} exit={{opacity:0, y:-8}} transition={{duration:0.2}} className="space-y-6">
              <div className="border-b border-border pb-4">
                <h2 className="text-2xl font-editorial font-bold text-foreground mb-0.5 tracking-tight">Overview & Surveillance Desk</h2>
                <p className="text-xs text-muted-foreground font-mono">Real-time payment telemetry and anomaly monitoring across Indian gateways</p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard title="Total Transactions" value={stats.total} icon={Activity} variant="blue" delay={0.1} trend="+12% this week" />
                <StatCard title="🟢 Safe" value={stats.safe} icon={ShieldCheck} variant="cyan" delay={0.2} trend={`${stats.total? ((stats.safe/stats.total)*100).toFixed(1):0}% of total`} />
                <StatCard title="🟡 Suspicious" value={stats.suspicious} icon={TrendingUp} variant="purple" delay={0.3} trend="Needs review" />
                <StatCard title="🔴 Fraud Detected" value={stats.fraud} icon={ShieldAlert} variant="danger" delay={0.4} trend={`${stats.total? ((stats.fraud/stats.total)*100).toFixed(1):0}% rate`} />
              </div>
              <FraudChart safeCount={stats.safe} suspiciousCount={stats.suspicious} fraudCount={stats.fraud} dailyData={dailyData} />
              <TransactionTable transactions={transactions} />
            </motion.div>
          ) : page==='analyze' ? (
            <motion.div key="analyze" initial={{opacity:0, y:10}} animate={{opacity:1, y:0}} exit={{opacity:0, y:-10}} transition={{duration:0.2}} className="space-y-6">
              <div>
                <h2 className="text-2xl font-display font-bold text-foreground mb-1 tracking-tight">Analyze Transaction</h2>
                <p className="text-xs text-muted-foreground font-mono">Submit a transaction payload for real-time risk scoring</p>
              </div>
              <TransactionForm onSubmit={handleNewTransaction} />
              <TransactionTable transactions={transactions} />
            </motion.div>
          ) : (
            <TransactionLedger />
          )}
        </AnimatePresence>
      </main>
      <SecurityCopilot transactions={transactions} />
    </div>
  );
}
