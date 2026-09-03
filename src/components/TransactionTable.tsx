import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Download, ChevronDown, ChevronRight } from "lucide-react";
import type { Transaction } from "@/lib/fraud-engine";
import { useAuth } from "@/contexts/AuthContext";

const statusBadge: Record<Transaction["status"], string> = {
  safe: "bg-[#EBF0EC] text-[#2D4A36] border-[#C8D6CB]",
  suspicious: "bg-[#F9F4EB] text-[#7A541E] border-[#E8D9C0]",
  fraud: "bg-[#F9EBEB] text-[#7A2E2E] border-[#E8C0C0]",
};

export default function TransactionTable({ transactions }: { transactions: Transaction[] }) {
  const [selectedTxIds, setSelectedTxIds] = useState<Set<string>>(new Set());
  const [expandedTxIds, setExpandedTxIds] = useState<Set<string>>(new Set());
  const { user } = useAuth();
  const isAnalystOrAdmin = user?.role === "ADMIN" || user?.role === "ANALYST";

  const toggleSelectAll = () => {
    if (selectedTxIds.size === transactions.slice(0, 10).length) {
      setSelectedTxIds(new Set());
    } else {
      setSelectedTxIds(new Set(transactions.slice(0, 10).map(t => t.id)));
    }
  };

  const toggleSelectRow = (id: string) => {
    const next = new Set(selectedTxIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedTxIds(next);
  };

  const toggleExpandRow = (id: string) => {
    const next = new Set(expandedTxIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setExpandedTxIds(next);
  };

  const handleExportCsv = () => {
    if (selectedTxIds.size === 0) return;
    
    const selectedTxs = transactions.filter(t => selectedTxIds.has(t.id));
    const headers = ["ID", "Amount", "Location", "Timestamp", "Score", "Status"];
    const rows = selectedTxs.map(t => [
      t.id, t.amount, t.location, t.timestamp, t.fraudScore, t.status
    ].join(","));
    
    const csvContent = [headers.join(","), ...rows].join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `fraudshield-export-${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: 0.3 }}
      className="editorial-card overflow-hidden"
    >
      <div className="px-6 py-4 border-b border-border bg-card flex items-center justify-between">
        <div>
          <h3 className="text-base font-editorial font-bold text-foreground tracking-tight">Ledger Journal: Recent Transactions</h3>
          <p className="text-xs text-muted-foreground font-mono mt-0.5">Recorded settlement activity and automated risk assessments</p>
        </div>
        <div className="flex items-center gap-3">
          {isAnalystOrAdmin && selectedTxIds.size > 0 && (
            <button 
              onClick={handleExportCsv}
              className="flex items-center gap-1.5 text-xs font-mono font-medium bg-foreground text-background px-3 py-1.5 rounded hover:opacity-90 transition-opacity"
            >
              <Download size={14} /> Export ({selectedTxIds.size})
            </button>
          )}
          <span className="text-[11px] font-mono text-muted-foreground border border-border bg-muted/60 px-2 py-0.5 rounded">
            {transactions.length} entries
          </span>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-border bg-muted/30">
              <th className="px-4 py-2.5 w-10 text-center">
                <input 
                  type="checkbox" 
                  checked={selectedTxIds.size > 0 && selectedTxIds.size === Math.min(10, transactions.length)}
                  onChange={toggleSelectAll}
                  className="accent-foreground"
                />
              </th>
              <th className="w-8"></th>
              {["Reference ID", "Amount", "Origin Hub", "Risk Score", "Audit Status", "Timestamp"].map((h) => (
                <th key={h} className="px-4 py-2.5 text-xs font-medium text-muted-foreground uppercase tracking-wider font-mono">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {transactions.slice(0, 10).map((tx, i) => (
              <React.Fragment key={tx.id}>
                <motion.tr
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.2, delay: i * 0.02 }}
                  className="hover:bg-muted/40 transition-colors cursor-pointer"
                  onClick={() => toggleExpandRow(tx.id)}
                >
                  <td className="px-4 py-3.5 text-center" onClick={(e) => e.stopPropagation()}>
                    <input 
                      type="checkbox" 
                      checked={selectedTxIds.has(tx.id)}
                      onChange={() => toggleSelectRow(tx.id)}
                      className="accent-foreground"
                    />
                  </td>
                  <td className="px-2 text-muted-foreground">
                    {expandedTxIds.has(tx.id) ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                  </td>
                  <td className="px-4 py-3.5 text-xs font-mono text-foreground font-medium">{tx.id}</td>
                  <td className="px-4 py-3.5 text-xs font-mono font-semibold text-foreground">₹{tx.amount.toLocaleString("en-IN")}</td>
                  <td className="px-4 py-3.5 text-xs text-foreground/90">{tx.location}</td>
                  <td className="px-4 py-3.5 text-xs font-mono font-bold text-foreground">{tx.fraudScore}%</td>
                  <td className="px-4 py-3.5">
                    <span className={`inline-flex items-center px-2 py-0.5 text-[11px] font-mono font-medium rounded border ${statusBadge[tx.status]}`}>
                      {tx.status.toUpperCase()}
                    </span>
                  </td>
                  <td className="px-4 py-3.5 text-xs font-mono text-muted-foreground">
                    {new Date(tx.timestamp).toLocaleDateString("en-IN", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                  </td>
                </motion.tr>
                
                <AnimatePresence>
                  {expandedTxIds.has(tx.id) && tx.featureAttribution && (
                    <motion.tr
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="bg-muted/10 border-b border-border/50 overflow-hidden"
                    >
                      <td colSpan={8} className="px-10 py-4">
                        <div className="max-w-md">
                          <h4 className="text-[11px] uppercase tracking-wider text-muted-foreground font-bold mb-3 font-mono">Risk Factor Attribution (SHAP)</h4>
                          <div className="space-y-2">
                            {Object.entries(tx.featureAttribution)
                              .filter(([_, weight]) => weight > 0)
                              .sort((a, b) => b[1] - a[1])
                              .map(([key, weight]) => (
                                <div key={key} className="flex items-center text-xs">
                                  <span className="w-32 font-mono text-foreground/80 capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                                  <div className="flex-1 h-2 bg-border rounded-full mx-3 overflow-hidden">
                                    <div 
                                      className="h-full bg-foreground" 
                                      style={{ width: `${Math.min(100, (weight / 50) * 100)}%` }} 
                                    />
                                  </div>
                                  <span className="w-8 text-right font-mono text-foreground font-bold">+{weight}</span>
                                </div>
                            ))}
                            {(!tx.featureAttribution || Object.values(tx.featureAttribution).every(w => w === 0)) && (
                              <p className="text-xs text-muted-foreground italic">No significant risk factors identified.</p>
                            )}
                          </div>
                        </div>
                      </td>
                    </motion.tr>
                  )}
                </AnimatePresence>
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>
    </motion.div>
  );
}
