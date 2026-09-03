import { motion } from "framer-motion";
import { Shield, Activity, BookOpen, LogOut, Scan } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

export type DashboardPage = "dashboard" | "analyze" | "ledger";

interface NavbarProps {
  currentPage: DashboardPage;
  onNavigate: (page: DashboardPage) => void;
}

const tabs: ReadonlyArray<readonly [DashboardPage, string, typeof Activity]> = [
  ["dashboard", "Dashboard", Activity],
  ["analyze", "Analyze", Scan],
  ["ledger", "Ledger", BookOpen],
];

export default function Navbar({ currentPage, onNavigate }: NavbarProps) {
  const { signOut, user } = useAuth();

  const handleNav = (page: DashboardPage) => {
    onNavigate(page);
  };

  return (
    <nav className="bg-card sticky top-0 z-40 px-6 py-3 border-b border-border shadow-[0_1px_0px_rgba(0,0,0,0.04)]">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded bg-primary text-primary-foreground flex items-center justify-center border border-primary">
            <Shield size={16} />
          </div>
          <div>
            <h1 className="font-editorial font-bold text-lg text-foreground tracking-tight leading-none">FraudShield</h1>
            <p className="text-[10px] text-muted-foreground font-mono mt-0.5 uppercase tracking-wider">Transaction Audit System</p>
          </div>
        </div>

        <div className="flex gap-1 bg-muted/60 rounded p-1 border border-border">
          {tabs.map(([key, label, Icon]) => (
            <button
              key={key}
              onClick={() => handleNav(key)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded text-xs font-mono transition-all cursor-pointer ${
                currentPage === key
                  ? "bg-primary text-primary-foreground font-medium shadow-[1px_1px_0px_rgba(0,0,0,0.05)] border border-primary"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
              }`}
            >
              <Icon size={14} />
              <span className="hidden sm:inline">{label}</span>
            </button>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden md:flex items-center gap-2">
            <span className="text-xs text-muted-foreground font-mono">{user?.email || "analyst@fraudshield.ai"}</span>
            <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded border border-border bg-muted/60 text-foreground">
              {user?.role || "ANALYST"}
            </span>
          </div>
          <button
            onClick={() => {
              if (typeof window !== "undefined") localStorage.removeItem("authenticated");
              void signOut();
            }}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded text-xs font-mono text-muted-foreground hover:text-foreground hover:bg-muted border border-border transition-all cursor-pointer"
          >
            <LogOut size={13} /> <span className="hidden sm:inline">Sign Out</span>
          </button>
        </div>
      </div>
    </nav>
  );
}
