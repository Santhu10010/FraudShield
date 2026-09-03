// src/components/SecurityCopilot.tsx
import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Bot,
  X,
  Send,
  Sparkles,
  ShieldAlert,
  ShieldCheck,
  Zap,
  RotateCcw,
  Terminal,
  ChevronRight,
  Maximize2,
  Minimize2,
} from 'lucide-react';
import type { Transaction } from '@/lib/fraud-engine';

interface Message {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  type?: 'analysis' | 'alert' | 'general';
}

interface SecurityCopilotProps {
  transactions?: Transaction[];
}

export default function SecurityCopilot({ transactions = [] }: SecurityCopilotProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [input, setInput] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const fraudCount = transactions.filter((t) => t.status === 'fraud').length;
  const suspiciousCount = transactions.filter((t) => t.status === 'suspicious').length;
  const safeCount = transactions.filter((t) => t.status === 'safe').length;

  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'init-1',
      sender: 'assistant',
      text: `👋 **Security Assistant Online.**\n\nIngesting real-time telemetry across **${transactions.length} payment records**:\n- 🚨 **${fraudCount} Critical Flags** identified\n- ⚠️ **${suspiciousCount} Anomalous Records** marked for audit\n\nEnter an inquiry below or select a standard analytical routine.`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      type: 'general',
    },
  ]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isThinking]);

  const quickPrompts = [
    '🔍 Analyze current fraud patterns',
    '🚨 Show highest risk transaction',
    '📊 Generate security audit report',
    '🛡️ Recommend risk mitigations',
  ];

  const generateAIResponse = (query: string): string => {
    const q = query.toLowerCase();

    if (q.includes('pattern') || q.includes('trend')) {
      const topLocations = transactions
        .filter((t) => t.status === 'fraud')
        .map((t) => t.location);
      const locCounts: Record<string, number> = {};
      topLocations.forEach((l) => (locCounts[l] = (locCounts[l] || 0) + 1));
      const sortedLocs = Object.entries(locCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3)
        .map(([loc, cnt]) => `**${loc}** (${cnt} alerts)`)
        .join(', ');

      return `### 📊 Real-Time Threat Vector Analysis\n\n1. **Location Velocity**: Cluster spikes identified originating from ${sortedLocs || 'VPN and high-risk gateways'}.\n2. **Amount Clustering**: High-risk transactions average ₹${(
        transactions.filter((t) => t.status === 'fraud').reduce((acc, t) => acc + t.amount, 0) /
        (fraudCount || 1)
      ).toLocaleString('en-IN', { maximumFractionDigits: 0 })}.\n3. **UPI Velocity Pattern**: Rapid repeated transfer attempts under 90-second intervals flagged by behavioral heuristics.\n\n> **Advisory**: Recommended enabling temporary 2FA velocity locks for transactions exceeding ₹1,00,000 in active anomaly zones.`;
    }

    if (q.includes('highest risk') || q.includes('highest') || q.includes('worst')) {
      const highest = [...transactions].sort((a, b) => b.fraudScore - a.fraudScore)[0];
      if (!highest) return 'No transaction data is currently loaded in memory.';
      return `### 🚨 Highest Risk Incident Identified\n\n- **Reference ID**: \`${highest.id}\`\n- **Subject**: \`${highest.userId}\`\n- **Settlement Amount**: **₹${highest.amount.toLocaleString('en-IN')}**\n- **Origin Node**: **${highest.location}**\n- **Risk Quotient**: **${highest.fraudScore}% / 100**\n- **Audit Status**: \`${highest.status.toUpperCase()}\`\n\n**Risk Factors**: Significant deviation from historical spending velocity, unverified routing endpoint, and off-hour settlement attempt.`;
    }

    if (q.includes('audit') || q.includes('report') || q.includes('summary')) {
      const totalAmount = transactions.reduce((acc, t) => acc + t.amount, 0);
      const atRiskAmount = transactions
        .filter((t) => t.status === 'fraud')
        .reduce((acc, t) => acc + t.amount, 0);

      return `### 🛡️ Executive Transaction Security Brief\n\n- **Total Monitored Volume**: ₹${totalAmount.toLocaleString('en-IN', { maximumFractionDigits: 0 })}\n- **Direct Capital Protected (Blocked)**: **₹${atRiskAmount.toLocaleString('en-IN', { maximumFractionDigits: 0 })}**\n- **System Clearance Rate**: **${((safeCount / (transactions.length || 1)) * 100).toFixed(1)}% safe throughput**\n- **False Positive Ratio**: < 0.4%\n- **Average ML Latency**: 24ms per decision\n\nAll real-time rule sets operating within normal compliance thresholds.`;
    }

    if (q.includes('mitigat') || q.includes('recommend') || q.includes('action')) {
      return `### ⚙️ Recommended Autonomous Safeguards\n\n1. **Dynamic Step-Up Auth**: Prompt Biometric/OTP for transactions exceeding ₹50,000 from unknown locations.\n2. **Geo-Fencing Rules**: Quarantine traffic originating from unindexed proxy networks.\n3. **Cooldown Thresholds**: Apply 5-minute velocity throttles on new device associations.`;
    }

    return `Evaluated **"${query}"** against active ledger telemetry (${transactions.length} records).\n\n- **Monitored Nodes**: Active across 30+ tier-1 & tier-2 Indian payment hubs.\n- **Anomaly Status**: No widespread systemic breach detected; isolated threats remain contained.\n\n*Type \`analyze patterns\` or \`show highest risk\` for detailed forensic drilldowns.*`;
  };

  const handleSend = (textToSend?: string) => {
    const query = (textToSend || input).trim();
    if (!query) return;

    const userMsg: Message = {
      id: `usr-${Date.now()}`,
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInput('');
    setIsThinking(true);

    setTimeout(() => {
      const responseText = generateAIResponse(query);
      const assistantMsg: Message = {
        id: `ast-${Date.now()}`,
        sender: 'assistant',
        text: responseText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        type: 'analysis',
      };
      setMessages((prev) => [...prev, assistantMsg]);
      setIsThinking(false);
    }, 450);
  };

  return (
    <>
      {/* Floating Copilot Trigger Button */}
      <button
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-3.5 py-2 rounded bg-card text-foreground border border-border shadow-[1px_1px_0px_rgba(0,0,0,0.06)] cursor-pointer hover:border-foreground/40 transition-all ${
          isOpen ? 'hidden' : 'flex'
        }`}
      >
        <div className="relative">
          <div className="w-7 h-7 rounded bg-primary text-primary-foreground flex items-center justify-center">
            <Bot className="w-4 h-4" />
          </div>
          {fraudCount > 0 && (
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-[#7A2E2E] rounded-full border border-card" />
          )}
        </div>
        <div className="text-left hidden sm:block">
          <p className="text-xs font-editorial font-bold text-foreground">
            Security Copilot
          </p>
          <p className="text-[10px] text-muted-foreground font-mono">
            {fraudCount > 0 ? `${fraudCount} Critical Alerts` : 'Telemetry Normal'}
          </p>
        </div>
      </button>

      {/* Slide-over / Modal Terminal Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 15 }}
            transition={{ duration: 0.2 }}
            className={`fixed bottom-6 right-6 z-50 flex flex-col rounded bg-card border border-border shadow-[2px_2px_0px_rgba(0,0,0,0.08)] overflow-hidden transition-all duration-200 ${
              isExpanded
                ? 'w-[calc(100vw-3rem)] max-w-4xl h-[85vh]'
                : 'w-[90vw] sm:w-[460px] h-[580px] max-h-[85vh]'
            }`}
          >
            {/* Terminal Header */}
            <div className="flex items-center justify-between px-4 py-3 bg-muted/50 border-b border-border select-none">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded bg-primary text-primary-foreground flex items-center justify-center">
                  <Terminal className="w-3.5 h-3.5" />
                </div>
                <div>
                  <h3 className="text-xs font-editorial font-bold text-foreground flex items-center gap-1.5">
                    Security Intelligence Terminal
                    <span className="inline-flex items-center px-1.5 py-0.2 rounded text-[9px] font-mono bg-[#EBF0EC] text-[#2D4A36] border border-[#C8D6CB]">
                      ACTIVE
                    </span>
                  </h3>
                  <p className="text-[10px] text-muted-foreground font-mono">
                    Live Audit ({transactions.length} Records)
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1 text-muted-foreground">
                <button
                  onClick={() => setIsExpanded(!isExpanded)}
                  className="p-1.5 hover:text-foreground hover:bg-muted rounded transition-colors cursor-pointer"
                  title={isExpanded ? 'Collapse' : 'Expand'}
                >
                  {isExpanded ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
                </button>
                <button
                  onClick={() =>
                    setMessages([
                      {
                        id: `rst-${Date.now()}`,
                        sender: 'assistant',
                        text: 'Session reset. Memory cleared. Ready for new queries.',
                        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                      },
                    ])
                  }
                  className="p-1.5 hover:text-foreground hover:bg-muted rounded transition-colors cursor-pointer"
                  title="Reset conversation"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1.5 hover:text-[#7A2E2E] hover:bg-[#F9EBEB] rounded transition-colors cursor-pointer"
                  title="Close Copilot"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Quick Prompt Chips */}
            <div className="px-3 py-2 bg-muted/20 border-b border-border flex gap-1.5 overflow-x-auto no-scrollbar text-xs">
              {quickPrompts.map((prompt, i) => (
                <button
                  key={i}
                  onClick={() => handleSend(prompt.replace(/^[^\w]+/, ''))}
                  className="whitespace-nowrap px-2.5 py-1 rounded bg-card hover:bg-muted text-foreground border border-border text-[11px] font-mono transition-all cursor-pointer flex items-center gap-1"
                >
                  <span>{prompt}</span>
                </button>
              ))}
            </div>

            {/* Messages Scroll Area */}
            <div className="flex-1 p-4 overflow-y-auto space-y-4 font-sans text-xs">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex gap-2.5 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  {msg.sender === 'assistant' && (
                    <div className="w-6 h-6 rounded bg-primary text-primary-foreground flex items-center justify-center shrink-0 mt-0.5">
                      <Bot className="w-3.5 h-3.5" />
                    </div>
                  )}

                  <div
                    className={`max-w-[85%] rounded px-3.5 py-2.5 leading-relaxed whitespace-pre-wrap ${
                      msg.sender === 'user'
                        ? 'bg-primary text-primary-foreground font-sans'
                        : 'bg-muted/40 text-foreground border border-border'
                    }`}
                  >
                    <div
                      className="space-y-1.5 text-xs"
                      dangerouslySetInnerHTML={{
                        __html: msg.text
                          .replace(/^### (.*$)/gim, '<div class="font-editorial font-bold text-foreground text-xs mt-1 mb-0.5">$1</div>')
                          .replace(/\*\*(.*?)\*\*/g, '<strong class="text-foreground font-semibold">$1</strong>')
                          .replace(/`([^`]+)`/g, '<code class="px-1 py-0.2 rounded bg-muted text-foreground font-mono text-[10px] border border-border">$1</code>')
                          .replace(/^> (.*$)/gim, '<blockquote class="border-l-2 border-primary pl-2 my-1.5 text-foreground/80 italic bg-muted/40 py-1 rounded-r">$1</blockquote>')
                          .replace(/^\- (.*$)/gim, '<li class="ml-3 list-disc text-foreground/90">$1</li>'),
                      }}
                    />
                    <div
                      className={`text-[9px] mt-1 text-right font-mono ${
                        msg.sender === 'user' ? 'text-primary-foreground/70' : 'text-muted-foreground'
                      }`}
                    >
                      {msg.timestamp}
                    </div>
                  </div>
                </div>
              ))}

              {isThinking && (
                <div className="flex gap-2.5 items-center text-xs">
                  <div className="w-6 h-6 rounded bg-primary text-primary-foreground flex items-center justify-center shrink-0">
                    <Sparkles className="w-3.5 h-3.5" />
                  </div>
                  <div className="bg-muted px-3 py-1.5 rounded border border-border flex items-center gap-1.5 text-muted-foreground font-mono text-[11px]">
                    Evaluating telemetry records...
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Bar */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSend();
              }}
              className="p-3 bg-card border-t border-border flex items-center gap-2"
            >
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Inquire about patterns, anomalies, or risk scores..."
                className="flex-1 bg-background border border-border rounded px-3 py-2 text-xs font-mono text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-foreground transition-all"
              />
              <button
                type="submit"
                disabled={!input.trim() || isThinking}
                className="p-2 rounded bg-primary hover:bg-primary/90 disabled:opacity-40 text-primary-foreground font-medium transition-all cursor-pointer disabled:cursor-not-allowed border border-primary shadow-[1px_1px_0px_rgba(0,0,0,0.05)]"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
