import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sliders, X, Save } from "lucide-react";
import { auditLogger } from "@/lib/audit-logger";
import { setFraudRules } from "@/lib/fraud-engine";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

interface RuleConfiguratorProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function RuleConfigurator({ isOpen, onClose }: RuleConfiguratorProps) {
  const { user } = useAuth();
  const [highAmount, setHighAmount] = useState(500000);

  const handleSave = () => {
    setFraudRules({ highAmountThreshold: highAmount });
    if (user) {
      auditLogger.log(
        user.email || "unknown",
        user.role,
        "Update Rule Thresholds",
        `High Amount: ${highAmount}`
      );
    }
    toast.success("Rule thresholds updated and audited.");
    onClose();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-background/80 z-40 backdrop-blur-sm"
        onClick={onClose}
      />
      <motion.div
        initial={{ x: "100%" }}
        animate={{ x: 0 }}
        exit={{ x: "100%" }}
        transition={{ type: "spring", bounce: 0, duration: 0.4 }}
        className="fixed top-0 right-0 h-full w-full sm:w-[400px] bg-card border-l border-border z-50 shadow-2xl flex flex-col"
      >
        <div className="p-6 border-b border-border flex items-center justify-between bg-muted/30">
          <div className="flex items-center gap-2">
            <Sliders size={18} className="text-foreground" />
            <h2 className="font-editorial font-bold text-lg text-foreground">Rule Configurator</h2>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-muted rounded text-muted-foreground transition-colors">
            <X size={18} />
          </button>
        </div>

        <div className="flex-1 p-6 overflow-y-auto space-y-8">
          <div className="space-y-4">
            <div>
              <label className="text-sm font-bold text-foreground font-editorial block mb-1">High Amount Threshold</label>
              <p className="text-xs text-muted-foreground font-mono mb-3">Transactions above this value trigger +35 risk score.</p>
              <div className="flex items-center gap-4">
                <input 
                  type="range" 
                  min="50000" 
                  max="1000000" 
                  step="50000"
                  value={highAmount} 
                  onChange={(e) => setHighAmount(Number(e.target.value))}
                  className="flex-1 accent-foreground"
                />
                <span className="font-mono text-sm w-24 text-right border border-border px-2 py-1 rounded bg-muted/20">
                  ₹{highAmount.toLocaleString("en-IN")}
                </span>
              </div>
            </div>

          </div>
          
          <div className="bg-muted/40 border border-border p-4 rounded-md">
            <h4 className="text-xs font-bold text-foreground font-editorial mb-2 uppercase tracking-wide">Audit Notice</h4>
            <p className="text-[11px] font-mono text-muted-foreground leading-relaxed">
              Modifying these thresholds directly impacts the live scoring engine. All changes are immutable and logged to the central audit trail.
            </p>
          </div>
        </div>

        <div className="p-6 border-t border-border bg-muted/20 flex justify-end gap-3">
          <button 
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-foreground hover:bg-muted border border-transparent rounded transition-colors"
          >
            Cancel
          </button>
          <button 
            onClick={handleSave}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium bg-foreground text-background rounded hover:opacity-90 transition-opacity"
          >
            <Save size={16} /> Save Rules
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
