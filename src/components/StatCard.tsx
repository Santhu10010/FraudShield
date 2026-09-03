import { motion } from "framer-motion";
import type { LucideIcon } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: string;
  variant: "purple" | "blue" | "cyan" | "danger";
  delay?: number;
}

const tone: Record<StatCardProps["variant"], { bg: string; icon: string; text: string }> = {
  purple: { bg: "bg-card border-border", icon: "bg-[#EAE6DF] text-[#34383D] border border-[#D8D3C8]", text: "text-[#34383D]" },
  blue:   { bg: "bg-card border-border", icon: "bg-[#E5E1D8] text-[#272A2E] border border-[#D8D3C8]", text: "text-[#272A2E]" },
  cyan:   { bg: "bg-card border-border", icon: "bg-[#EBF0EC] text-[#2D4A36] border border-[#C8D6CB]", text: "text-[#2D4A36]" },
  danger: { bg: "bg-card border-border", icon: "bg-[#F9EBEB] text-[#7A2E2E] border border-[#E8C0C0]", text: "text-[#7A2E2E]" },
};

export default function StatCard({ title, value, icon: Icon, trend, variant, delay = 0 }: StatCardProps) {
  const t = tone[variant];
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay, ease: "easeOut" }}
      className="editorial-card p-5 hover:border-foreground/40 transition-colors"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground mb-1">{title}</p>
          <p className="text-2xl sm:text-3xl font-bold font-mono text-foreground tracking-tight">
            {value}
          </p>
          {trend && <p className="text-[11px] text-muted-foreground mt-2 font-mono">{trend}</p>}
        </div>
        <div className={`p-2 rounded ${t.icon}`}>
          <Icon size={18} />
        </div>
      </div>
    </motion.div>
  );
}
