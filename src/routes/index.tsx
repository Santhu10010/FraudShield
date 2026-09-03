import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Shield, Activity, BookOpen, Scan, ArrowRight, Zap, Lock, Globe } from "lucide-react";

export const Route = createFileRoute("/")({
  component: Landing,
});

function Landing() {
  return (
    <div className="min-h-screen gradient-bg">
      {/* Top nav */}
      <header className="px-6 py-5">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg gradient-primary flex items-center justify-center neon-glow">
              <Shield size={20} className="text-primary-foreground" />
            </div>
            <div>
              <p className="font-display font-bold text-lg text-gradient leading-none">FraudShield</p>
              <p className="text-[11px] text-muted-foreground">AI-Powered Detection</p>
            </div>
          </div>
          <Link
            to="/login"
            className="px-4 py-2 rounded-lg gradient-primary text-primary-foreground text-sm font-semibold neon-glow"
          >
            Sign in
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="px-6 pt-12 pb-24">
        <div className="max-w-5xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full glass text-xs text-muted-foreground mb-6"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-[#2D4A36] animate-pulse" />
            Real-time fraud monitoring across India
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.05 }}
            className="text-5xl md:text-7xl font-display font-bold tracking-tight"
          >
            Stop fraud before
            <br />
            <span className="text-gradient">it costs you ₹</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="mt-6 text-lg text-muted-foreground max-w-2xl mx-auto"
          >
            Score every transaction in milliseconds. FraudShield detects UPI scams, account takeovers and risky
            behaviour using AI tuned for the Indian financial landscape.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.25 }}
            className="mt-10 flex items-center justify-center gap-3 flex-wrap"
          >
            <Link
              to="/login"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl gradient-primary text-primary-foreground font-semibold neon-glow"
            >
              Launch Dashboard <ArrowRight size={18} />
            </Link>
            <a
              href="#features"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl glass font-medium text-foreground"
            >
              See how it works
            </a>
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="px-6 pb-24">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {[
            { Icon: Activity, title: "Real-time scoring", desc: "Every transaction scored 0–100 in under a second." },
            { Icon: Scan, title: "Behaviour analysis", desc: "Catches new device, OTP sharing and rapid-fire patterns." },
            { Icon: BookOpen, title: "Searchable ledger", desc: "Every analysis stored, filtered and exportable to CSV." },
            { Icon: Globe, title: "Built for India", desc: "Tuned for UPI, RBI guidelines and 30+ Indian metros." },
          ].map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.06 }}
              className="glass rounded-xl p-6"
            >
              <div className="w-10 h-10 rounded-lg gradient-primary flex items-center justify-center mb-4">
                <f.Icon size={18} className="text-primary-foreground" />
              </div>
              <p className="font-display font-semibold mb-1">{f.title}</p>
              <p className="text-sm text-muted-foreground">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Trust strip */}
      <section className="px-6 pb-24">
        <div className="max-w-5xl mx-auto glass-strong rounded-2xl p-8 md:p-12 grid md:grid-cols-3 gap-8 text-center">
          <div>
            <p className="text-4xl font-display font-bold text-gradient">99.4%</p>
            <p className="text-sm text-muted-foreground mt-1">Fraud detection accuracy</p>
          </div>
          <div>
            <p className="text-4xl font-display font-bold text-gradient">&lt;200ms</p>
            <p className="text-sm text-muted-foreground mt-1">Average analysis latency</p>
          </div>
          <div>
            <p className="text-4xl font-display font-bold text-gradient">24/7</p>
            <p className="text-sm text-muted-foreground mt-1">Continuous monitoring</p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-6 pb-24">
        <div className="max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full glass text-xs text-muted-foreground mb-4">
            <Lock size={12} /> Secured by Lovable Cloud
          </div>
          <h2 className="text-3xl md:text-5xl font-display font-bold">
            Ready to protect every <span className="text-gradient">rupee</span>?
          </h2>
          <p className="text-muted-foreground mt-4">Create your free account and start scoring transactions in under a minute.</p>
          <Link
            to="/login"
            className="mt-8 inline-flex items-center gap-2 px-6 py-3 rounded-xl gradient-primary text-primary-foreground font-semibold neon-glow"
          >
            <Zap size={18} /> Get started — it's free
          </Link>
        </div>
      </section>

      <footer className="px-6 py-8 border-t">
        <div className="max-w-7xl mx-auto flex items-center justify-between text-xs text-muted-foreground flex-wrap gap-2">
          <p>© {new Date().getFullYear()} FraudShield. AI-powered fraud detection for India.</p>
          <p className="font-mono">v1.0</p>
        </div>
      </footer>
    </div>
  );
}
