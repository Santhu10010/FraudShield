import { motion, AnimatePresence } from "framer-motion";
import { ShieldAlert, X } from "lucide-react";
import { useEffect } from "react";

interface FraudAlertProps {
  message: string | null;
  onClose: () => void;
  featureAttribution?: Record<string, number>;
}

export default function FraudAlert({ message, onClose, featureAttribution }: FraudAlertProps) {
  useEffect(() => {
    if (!message) return;
    const t = setTimeout(onClose, 5000);
    return () => clearTimeout(t);
  }, [message, onClose]);

  return (
    <AnimatePresence>
      {message && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
          className="fixed top-6 right-6 z-[100] max-w-sm"
        >
          <div className="bg-[#F9EBEB] text-[#7A2E2E] border border-[#E8C0C0] rounded p-4 shadow-[1px_1px_0px_rgba(0,0,0,0.05)] flex items-start gap-3">
            <div className="p-1.5 rounded bg-[#E8C0C0]/40 flex-shrink-0">
              <ShieldAlert size={18} className="text-[#7A2E2E]" />
            </div>
            <div className="flex-1">
              <p className="font-editorial font-bold text-sm tracking-tight text-[#7A2E2E]">Security Notice: Transaction Flagged</p>
              <p className="text-xs text-[#7A2E2E]/85 mt-0.5 font-sans leading-relaxed mb-2">{message}</p>
              
              {featureAttribution && Object.keys(featureAttribution).length > 0 && (
                <div className="mt-2 space-y-1.5 pt-2 border-t border-[#E8C0C0]/50">
                  <p className="text-[10px] uppercase tracking-wider text-[#7A2E2E]/80 font-bold mb-1">Risk Factors (SHAP)</p>
                  {Object.entries(featureAttribution)
                    .filter(([_, weight]) => weight > 0)
                    .sort((a, b) => b[1] - a[1])
                    .map(([key, weight]) => (
                      <div key={key} className="flex items-center text-[10px]">
                        <span className="w-24 font-mono text-[#7A2E2E]/70 truncate">{key}</span>
                        <div className="flex-1 h-1.5 bg-[#E8C0C0]/30 rounded-full mx-2 overflow-hidden">
                          <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: `${Math.min(100, (weight / 50) * 100)}%` }}
                            transition={{ duration: 0.5, delay: 0.2 }}
                            className="h-full bg-[#7A2E2E]"
                          />
                        </div>
                        <span className="w-6 text-right font-mono text-[#7A2E2E] font-bold">+{weight}</span>
                      </div>
                  ))}
                </div>
              )}
            </div>
            <button
              onClick={onClose}
              className="text-[#7A2E2E]/60 hover:text-[#7A2E2E] transition-colors p-0.5 cursor-pointer"
            >
              <X size={14} />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
